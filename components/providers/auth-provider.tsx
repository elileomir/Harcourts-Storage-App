"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile to get role with retry logic
          let retries = 3;
          while (retries > 0) {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single();

            if (!error && profile) {
              setRole(profile.role ?? "user");
              break;
            }

            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              // Fallback to user metadata or default
              setRole(session.user.user_metadata?.role ?? "user");
            }
          }
        } else {
          setRole(null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthProvider] Auth state change:", event);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch profile to get role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setRole(profile?.role ?? session.user.user_metadata?.role ?? "user");
      } else {
        setRole(null);
      }

      // Handle sign-out
      if (event === "SIGNED_OUT") {
        const authPages = ["/login", "/set-password", "/auth/callback"];
        const isOnAuthPage = authPages.some((page) =>
          window.location.pathname.startsWith(page)
        );

        if (!isOnAuthPage) {
          console.log("[AuthProvider] User signed out, redirecting to login");
          router.push("/login");
          router.refresh();
        }
      }

      // Handle password update (invite flow completion)
      if (event === "USER_UPDATED") {
        console.log("[AuthProvider] User updated (password set)");
        // Don't refresh here - let the set-password page handle redirect
        // router.refresh() was causing page reload and interrupting redirect logic
      }

      // Handle initial sign-in or successful token refresh
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        console.log("[AuthProvider] Session refreshed/established");

        // Force re-authentication of all Supabase clients
        // This ensures real-time channels use the new token
        if (event === "TOKEN_REFRESHED" && session) {
          console.log("[AuthProvider] Token refreshed, invalidating queries");
          // Invalidate all queries to force refetch with new token
          queryClient.invalidateQueries();

          // NOTE: We do NOT call router.refresh() here because it can cause
          // race conditions with user navigation and "loading" hangs if the
          // refresh happens while the user is trying to click a link.
          // The next navigation will naturally pick up the new cookie.
        } else if (event === "SIGNED_IN") {
          console.log("[AuthProvider] Signed in, refreshing router");
          router.refresh();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, queryClient]); // supabase is stable

  const signOut = async () => {
    try {
      console.log("[AuthProvider] Signing out...");
      // Clear React Query cache before signing out
      queryClient.clear();

      // Sign out - this will trigger SIGNED_OUT event which handles redirect
      await supabase.auth.signOut();

      console.log("[AuthProvider] Sign-out completed");
      // The onAuthStateChange handler will receive SIGNED_OUT event and redirect to /login
      // No need to manually redirect here
    } catch (error) {
      console.error("[AuthProvider] Error signing out:", error);
      // If sign-out fails, still try to redirect to login
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading, signOut }}>
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
