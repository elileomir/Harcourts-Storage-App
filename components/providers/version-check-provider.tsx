"use client";

import { ReactNode, useEffect, useRef } from "react";
import { toast } from "sonner";

const POLL_INTERVAL_MS = 60_000;
const RELOAD_GRACE_MS = 5_000;

export function VersionCheckProvider({ children }: { children: ReactNode }) {
  const clientBuildId = process.env.NEXT_PUBLIC_BUILD_ID;
  const reloadScheduledRef = useRef(false);

  useEffect(() => {
    if (!clientBuildId) return;

    const scheduleReload = (serverBuildId: string) => {
      if (reloadScheduledRef.current) return;
      reloadScheduledRef.current = true;

      console.log(
        `[VersionCheck] Build mismatch — client=${clientBuildId} server=${serverBuildId}. Reloading in ${RELOAD_GRACE_MS}ms.`
      );

      toast.info("A new version is available. Reloading…", {
        duration: RELOAD_GRACE_MS,
      });

      setTimeout(() => {
        window.location.reload();
      }, RELOAD_GRACE_MS);
    };

    const check = async () => {
      if (reloadScheduledRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;

      try {
        const res = await fetch("/api/version", {
          cache: "no-store",
          credentials: "omit",
        });
        if (!res.ok) return;
        const { buildId: serverBuildId } = (await res.json()) as {
          buildId?: string;
        };
        if (
          serverBuildId &&
          serverBuildId !== "unknown" &&
          serverBuildId !== clientBuildId
        ) {
          scheduleReload(serverBuildId);
        }
      } catch {
        // Network blips are fine — next tick will retry.
      }
    };

    void check();

    const interval = window.setInterval(check, POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (!document.hidden) void check();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [clientBuildId]);

  return <>{children}</>;
}
