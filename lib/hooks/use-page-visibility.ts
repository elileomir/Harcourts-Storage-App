import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to track page visibility and refresh session after idle.
 *
 * Purpose:
 * - Detects when user switches away from the tab (tab becomes hidden)
 * - Measures how long the tab was hidden
 * - Proactively refreshes session if tab was hidden for more than 5 minutes
 * - This ensures fresh auth tokens before client-side navigation/data fetching
 *
 * How it works:
 * - Uses Page Visibility API (document.visibilitychange event)
 * - Records timestamp when tab becomes hidden
 * - When tab becomes visible again, calculates idle duration
 * - If idle > 5 min, calls getSession() to refresh expired tokens
 * - Invalidates React Query cache to refetch with fresh tokens
 *
 * @returns {boolean} isVisible - Current visibility state of the page
 */
// Idle threshold: 5 minutes (well before 1-hour token expiry)
const IDLE_THRESHOLD_MS = 5 * 60 * 1000;

export function usePageVisibility(): boolean {
  // Check if we're in browser environment (SSR-safe)
  const isBrowser = typeof window !== "undefined";
  const [isVisible, setIsVisible] = useState<boolean>(
    isBrowser ? !document.hidden : true
  );
  const hiddenSinceRef = useRef<number | null>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Idle threshold: 5 minutes (well before 1-hour token expiry)
  // This ensures we refresh before token expires
  // Moved outside to avoid dependency issues

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;

    async function handleVisibilityChange(): Promise<void> {
      if (document.hidden) {
        // Tab just became hidden - record the timestamp
        hiddenSinceRef.current = Date.now();
        setIsVisible(false);
        console.log("[PageVisibility] Tab hidden");
      } else {
        // Tab just became visible - check how long it was hidden
        const hiddenDuration = hiddenSinceRef.current
          ? Date.now() - hiddenSinceRef.current
          : 0;

        const hiddenMinutes = Math.floor(hiddenDuration / 60000);

        if (hiddenDuration > IDLE_THRESHOLD_MS) {
          // Tab was hidden for more than 5 minutes
          // Proactively refresh session to ensure token is fresh
          console.log(
            `[PageVisibility] Tab was hidden for ${hiddenMinutes} minutes - refreshing session`
          );

          try {
            // getSession() will automatically refresh expired tokens
            const {
              data: { session },
              error,
            } = await supabase.auth.getSession();

            if (error) {
              console.error(
                "[PageVisibility] Error refreshing session:",
                error
              );
            } else if (session) {
              console.log("[PageVisibility] Session refreshed successfully");
              // Invalidate all queries to refetch with fresh token
              queryClient.invalidateQueries();
            } else {
              console.log("[PageVisibility] No active session");
            }
          } catch (error) {
            console.error(
              "[PageVisibility] Exception refreshing session:",
              error
            );
          }
        } else {
          console.log(
            `[PageVisibility] Tab visible after ${hiddenMinutes} minutes - no session refresh needed`
          );
        }

        hiddenSinceRef.current = null;
        setIsVisible(true);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [supabase, queryClient]);

  return isVisible;
}
