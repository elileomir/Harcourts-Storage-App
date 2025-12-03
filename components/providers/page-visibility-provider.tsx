"use client";

import { ReactNode } from "react";
import { usePageVisibility } from "@/lib/hooks/use-page-visibility";

/**
 * Provider component that activates page visibility tracking.
 *
 * Purpose:
 * - Wraps the app to enable usePageVisibility hook
 * - Hook handles session refresh when tab becomes visible after 5+ min idle
 * - Hook also invalidates React Query cache after refresh
 * - No additional logic needed here - hook does all the work
 *
 * @param {ReactNode} children - Child components to render
 */
export function PageVisibilityProvider({ children }: { children: ReactNode }) {
  // Just activate the hook - it handles everything
  usePageVisibility();

  return <>{children}</>;
}
