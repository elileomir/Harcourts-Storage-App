import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RealtimeChannelConfig {
  event: string;
  schema: string;
  table: string;
  callback: () => void;
}

/**
 * Custom hook for managing Supabase real-time channels with automatic reconnection
 *
 * Features:
 * - Automatic reconnection on channel errors or timeouts
 * - Reconnects when browser tab becomes visible after being backgrounded
 * - Proper cleanup to prevent memory leaks
 * - Status monitoring and logging
 *
 * @param channelName - Unique name for the real-time channel
 * @param config - Array of postgres_changes event configurations
 *
 * @example
 * ```typescript
 * useRealtimeChannel('bookings-realtime', [
 *   {
 *     event: '*',
 *     schema: 'public',
 *     table: 'bookings',
 *     callback: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
 *   }
 * ])
 * ```
 */
export function useRealtimeChannel(
  channelName: string,
  config: RealtimeChannelConfig[]
) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    isUnmountedRef.current = false;

    const setupChannel = async () => {
      // Don't setup if component has unmounted
      if (isUnmountedRef.current) return;

      // Check for session first
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (isUnmountedRef.current) return;

      if (!session) {
        console.log(`[${channelName}] No active session, waiting...`);
        return;
      }

      if (channelRef.current) {
        console.log(
          `[${channelName}] Removing existing channel before reconnect`
        );
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Create new channel
      let channel = supabase.channel(channelName);

      // Add all event listeners
      config.forEach(({ event, schema, table, callback }) => {
        channel = channel.on(
          "postgres_changes" as unknown as "system",
          { event, schema, table } as unknown as Record<string, never>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback as any
        );
      });

      // Monitor channel status for errors and timeouts
      channel.on("system", {}, (payload) => {
        console.log(`[${channelName}] System event:`, payload.status, payload);

        // Only reconnect on transient errors (timeouts), not persistent errors
        // CHANNEL_ERROR usually means a configuration issue (RLS, realtime not enabled, etc.)
        // TIMED_OUT means a network issue that might resolve on retry
        if (payload.status === "TIMED_OUT") {
          console.warn(
            `[${channelName}] Connection timed out, reconnecting in 1s...`
          );

          // Clear any existing reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          // Schedule reconnection
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isUnmountedRef.current) {
              console.log(`[${channelName}] Attempting reconnection...`);
              setupChannel();
            }
          }, 1000);
        } else if (payload.status === "CHANNEL_ERROR") {
          console.error(
            `[${channelName}] ❌ Persistent channel error - check Supabase Realtime configuration`
          );
          // Attempt one retry on CHANNEL_ERROR after a longer delay, in case it was a transient auth issue
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isUnmountedRef.current) {
              console.log(`[${channelName}] Retrying after CHANNEL_ERROR...`);
              setupChannel();
            }
          }, 5000);
        }
      });

      // Subscribe to the channel
      channel.subscribe((status) => {
        console.log(`[${channelName}] Subscription status:`, status);

        if (status === "SUBSCRIBED") {
          console.log(`[${channelName}] ✅ Successfully subscribed`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`[${channelName}] ❌ Subscription failed`);
        } else if (status === "TIMED_OUT") {
          console.warn(`[${channelName}] ⏱️ Subscription timed out`);
        }
      });

      channelRef.current = channel;
    };

    // Initial setup
    setupChannel();

    // Listen for auth state changes to trigger reconnection
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        console.log(`[${channelName}] Auth event: ${event}, reconnecting...`);
        setupChannel();
      } else if (event === "SIGNED_OUT") {
        console.log(`[${channelName}] User signed out, cleaning up channel`);
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      }
    });

    // Reconnect when tab becomes visible after being backgrounded
    // This handles the case where browser throttles background tabs and closes WebSocket connections
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        channelRef.current &&
        !isUnmountedRef.current
      ) {
        const state = channelRef.current.state;
        console.log(
          `[${channelName}] Tab became visible, channel state:`,
          state
        );

        // Reconnect if channel is not fully joined
        // This covers 'closed', 'errored', 'joining', 'leaving' - basically anything that isn't a healthy connection
        if (state !== "joined") {
          console.log(
            `[${channelName}] 🔄 Tab visible with unhealthy channel (${state}), reconnecting...`
          );
          setupChannel();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      isUnmountedRef.current = true;
      subscription.unsubscribe();

      if (channelRef.current) {
        console.log(`[${channelName}] Cleaning up channel`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = undefined;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, supabase]);
  // Note: We intentionally exclude 'config' from dependencies to avoid
  // recreating the channel when callbacks change. The channel setup uses
  // the current config values via closure. This is safe because the config
  // structure (table names, schemas) doesn't change at runtime.
}
