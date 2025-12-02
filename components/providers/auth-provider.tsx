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
          // Use window.location for full reload to avoid hydration issues
          window.location.href = "/login";
        }
      }

      // Handle password update (invite flow completion)
      if (event === "USER_UPDATED") {
        console.log("[AuthProvider] User updated (password set)");
        // Don't refresh here - let the set-password page handle redirect
      }

      // Handle sign-in - ONLY redirect from auth pages to dashboard
      // DO NOT reload on app pages - let React Query and middleware handle freshness
      if (event === "SIGNED_IN") {
        const authPages = ["/login", "/set-password", "/auth/callback"];
        const isOnAuthPage = authPages.some((page) =>
          window.location.pathname.startsWith(page)
        );

        if (isOnAuthPage) {
          console.log(
            "[AuthProvider] Login successful, redirecting to dashboard"
          );
          window.location.href = "/dashboard";
        } else {
          console.log(
            "[AuthProvider] SIGNED_IN on app page - no action needed (middleware handles session)"
          );
        }
      }

      // Handle token refresh - invalidate queries to refetch with new token
      if (event === "TOKEN_REFRESHED") {
        console.log("[AuthProvider] Token refreshed, invalidating all queries");
        queryClient.invalidateQueries();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, queryClient, supabase]);

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
