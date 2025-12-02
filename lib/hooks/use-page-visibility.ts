import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to track page visibility and handle idle timeout.
 *
 * Purpose:
 * - Detects when user switches away from the tab (tab becomes hidden)
 * - Measures how long the tab was hidden
 * - Forces a page reload if tab was hidden for more than 30 minutes
 * - This ensures fresh app state after extended idle without logging user out
 *
 * How it works:
 * - Uses Page Visibility API (document.visibilitychange event)
 * - Records timestamp when tab becomes hidden
 * - When tab becomes visible again, calculates idle duration
 * - If idle > 30 min, triggers window.location.reload()
 * - If idle < 30 min, just updates visibility state
 *
 * @returns {boolean} isVisible - Current visibility state of the page
 */
export function usePageVisibility(): boolean {
  // Track current visibility state
  const [isVisible, setIsVisible] = useState<boolean>(!document.hidden);

  // Store timestamp when tab became hidden (null when visible)
  const hiddenSinceRef = useRef<number | null>(null);

  // Idle threshold: 30 minutes in milliseconds
  // After this duration, page will reload when tab becomes visible
  const IDLE_THRESHOLD_MS = 30 * 60 * 1000;

  useEffect(() => {
    /**
     * Handler for visibility change events
     * Fires when user switches tabs, minimizes window, or returns to tab
     */
    function handleVisibilityChange(): void {
      if (document.hidden) {
        // Tab just became hidden - record the timestamp
        hiddenSinceRef.current = Date.now();
        setIsVisible(false);
        console.log("[PageVisibility] Tab hidden at", new Date().toISOString());
      } else {
        // Tab just became visible - check how long it was hidden
        const hiddenDuration = hiddenSinceRef.current
          ? Date.now() - hiddenSinceRef.current
          : 0;

        const hiddenMinutes = Math.floor(hiddenDuration / 60000);

        if (hiddenDuration > IDLE_THRESHOLD_MS) {
          // Tab was hidden for more than 30 minutes - force reload
          // This ensures fresh app state and prevents stale data issues
          console.log(
            `[PageVisibility] Tab was hidden for ${hiddenMinutes} minutes - forcing page reload for fresh state`
          );

          // Force a hard reload to clear all cached state
          // User stays logged in (session persists) but gets fresh app state
          window.location.reload();

          // Don't update state - we're reloading anyway
          return;
        }

        // Tab was hidden for less than threshold - just update state
        // React Query will handle cache invalidation via refetchOnWindowFocus
        console.log(
          `[PageVisibility] Tab visible after ${hiddenMinutes} minutes - normal cache refresh`
        );

        hiddenSinceRef.current = null;
        setIsVisible(true);
      }
    }

    // Listen for visibility changes
    // This event fires when user:
    // - Switches to another tab
    // - Minimizes/maximizes window
    // - Locks screen (depending on browser)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []); // Empty deps - set up once on mount

  return isVisible;
}
