"use client";

import { useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePageVisibility } from "@/lib/hooks/use-page-visibility";

/**
 * Provider component that handles cache invalidation based on page visibility.
 *
 * Purpose:
 * - Works in tandem with usePageVisibility hook
 * - When tab becomes visible after short absence, invalidates React Query cache
 * - This triggers automatic refetch of all stale queries
 * - Combined with usePageVisibility, provides:
 *   • Short idle (<30 min): Cache invalidation + refetch
 *   • Long idle (>30 min): Full page reload (handled by hook)
 *
 * Why this works:
 * - React Query's refetchOnWindowFocus handles normal tab switches
 * - This provider adds extra invalidation for safety
 * - Page reload (from hook) handles extended idle to prevent stale state
 *
 * @param {ReactNode} children - Child components to render
 */
export function PageVisibilityProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const isVisible = usePageVisibility();

  useEffect(() => {
    if (isVisible) {
      // Tab just became visible (and didn't trigger a reload)
      // This means idle duration was < 30 minutes
      // Invalidate all queries to force refetch with fresh data
      console.log(
        "[PageVisibility] Invalidating React Query cache for fresh data"
      );
      queryClient.invalidateQueries();
    }
  }, [isVisible, queryClient]);

  return <>{children}</>;
}
