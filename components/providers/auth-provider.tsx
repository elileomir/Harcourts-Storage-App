"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: string | null;
  isLoading: boolean;
  initError: Error | null;
  retryInit: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Upper bound on auth init. If we exceed it, stop rendering the spinner and surface
// an error — better to show a "Reload" button than hang on a blank loader.
const INIT_TIMEOUT_MS = 10_000;

// PGRST116 = "no rows returned" from .single() — the real "not invited" signal.
// Any other error (RLS failure, network, 5xx) is transient and should NOT sign the user out.
const NO_ROWS_CODE = "PGRST116";

type ProfileFetchResult =
  | { kind: "ok"; role: string }
  | { kind: "not_invited" }
  | { kind: "error"; error: unknown };

async function fetchProfileRole(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<ProfileFetchResult> {
  const maxAttempts = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!error && data) {
      return { kind: "ok", role: data.role ?? "user" };
    }

    if (error && (error.code === NO_ROWS_CODE || error.details?.includes("0 rows"))) {
      return { kind: "not_invited" };
    }

    lastError = error;
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return { kind: "error", error: lastError };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);
  const [initAttempt, setInitAttempt] = useState(0);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const retryInit = useCallback(() => {
    setInitError(null);
    setIsLoading(true);
    setInitAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const sb = supabase;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (cancelled) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setRole(null);
        return;
      }

      // Prefer the server-controlled app_metadata role (set by security-update 2026-04-21).
      // user_metadata is user-writable and no longer authoritative.
      const appRole = (session.user.app_metadata as { role?: string } | undefined)?.role;
      if (appRole) {
        setRole(appRole);
      }

      // Still fetch from profiles as the source of truth — app_metadata is a hint.
      const result = await fetchProfileRole(sb, session.user.id);
      if (cancelled) return;

      if (result.kind === "ok") {
        setRole(result.role);
        return;
      }

      if (result.kind === "not_invited") {
        console.warn("[AuthProvider] No profile row — user not invited. Signing out.");
        await sb.auth.signOut();
        window.location.href =
          "/login?error=access_denied&error_description=You%20must%20be%20invited%20to%20access%20this%20application";
        return;
      }

      // Transient error fetching profiles (network blip, RLS hiccup, 5xx).
      // Graceful degradation order:
      //   1. JWT already gave us app_metadata.role → use that, app works normally.
      //   2. No role anywhere yet → fall back to "user". The user sees a minimal
      //      (non-admin) view instead of a recovery card. Admins still read as
      //      "user" in this branch, but that's recoverable on the next token
      //      refresh, and it's strictly better than leaving everyone stuck on
      //      a spinner/error screen because a single /rest/v1/profiles call
      //      flaked out.
      // We only surface initError (the recovery card) when there is no session
      // at all, which is handled above by the early `if (!session?.user) return`.
      if (appRole) {
        console.warn(
          "[AuthProvider] Transient profile fetch error; using JWT app_metadata.role.",
          result.error
        );
        return;
      }

      console.warn(
        "[AuthProvider] Transient profile fetch error and no app_metadata.role; defaulting to 'user'.",
        result.error
      );
      setRole("user");
    };

    withTimeout(initializeAuth(), INIT_TIMEOUT_MS, "Auth initialization")
      .catch((err) => {
        if (cancelled) return;
        console.error("[AuthProvider] Init failed:", err);
        setInitError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initAttempt, supabase]);

  useEffect(() => {
    const sb = supabase;

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthProvider] Auth state change:", event);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const appRole = (session.user.app_metadata as { role?: string } | undefined)?.role;
        if (appRole) {
          setRole(appRole);
        } else {
          const result = await fetchProfileRole(sb, session.user.id);
          if (result.kind === "ok") {
            setRole(result.role);
          } else if (result.kind === "not_invited") {
            console.warn(
              "[AuthProvider] No profile found on auth change — user not invited. Signing out."
            );
            await sb.auth.signOut();
            window.location.href =
              "/login?error=access_denied&error_description=You%20must%20be%20invited%20to%20access%20this%20application";
            return;
          }
          // Transient error: keep whatever role we had, don't sign out.
        }
      } else {
        setRole(null);
      }

      if (event === "SIGNED_OUT") {
        const authPages = ["/login", "/set-password", "/auth/callback"];
        const isOnAuthPage = authPages.some((page) =>
          window.location.pathname.startsWith(page)
        );
        if (!isOnAuthPage) {
          window.location.href = "/login";
        }
      }

      if (event === "SIGNED_IN") {
        const authPages = ["/login", "/set-password", "/auth/callback"];
        const isOnAuthPage = authPages.some((page) =>
          window.location.pathname.startsWith(page)
        );
        if (isOnAuthPage) {
          window.location.href = "/dashboard";
        }
      }

      // Targeted invalidation so profile/session-scoped queries pick up the new token,
      // but we don't re-run every list/chart query and trigger the cascade that
      // commit c98838f removed.
      if (event === "TOKEN_REFRESHED") {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, supabase]);

  const signOut = async () => {
    try {
      queryClient.clear();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[AuthProvider] Error signing out:", error);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, role, isLoading, initError, retryInit, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
