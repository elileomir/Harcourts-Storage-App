"use client";

import {
  Loader2,
  PhoneOutgoing,
  PhoneCall,
  PhoneOff,
  TriangleAlert,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { RetellCallStatus } from "@/lib/penny-outbound/types";

interface StatusBadgeProps {
  status: RetellCallStatus | string;
  /** Show full label (default) or icon-only (compact). */
  compact?: boolean;
}

interface StatusStyle {
  label: string;
  classes: string;
  Icon: React.ComponentType<{ className?: string }>;
  /** When true, animate the icon (spin/pulse). Reduced-motion overrides this. */
  animate: "spin" | "pulse" | "none";
}

const STYLES: Record<string, StatusStyle> = {
  initiating: {
    label: "Initiating",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    Icon: Loader2,
    animate: "spin",
  },
  registered: {
    label: "Calling",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    Icon: PhoneOutgoing,
    animate: "pulse",
  },
  ongoing: {
    label: "On call",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Icon: PhoneCall,
    animate: "pulse",
  },
  ended: {
    label: "Ended",
    classes: "bg-slate-100 text-slate-700 border-slate-200",
    Icon: PhoneOff,
    animate: "none",
  },
  failed: {
    label: "Failed",
    classes: "bg-red-50 text-red-700 border-red-200",
    Icon: TriangleAlert,
    animate: "none",
  },
};

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const reduced = useReducedMotion();
  const style = STYLES[status] ?? {
    label: status,
    classes: "bg-gray-50 text-gray-700 border-gray-200",
    Icon: PhoneOutgoing,
    animate: "none" as const,
  };

  const motionClass =
    reduced || style.animate === "none"
      ? ""
      : style.animate === "spin"
        ? "animate-spin"
        : "animate-pulse";

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-md border ${style.classes}`}
    >
      <style.Icon className={`w-3 h-3 ${motionClass}`} aria-hidden="true" />
      {!compact && <span>{style.label}</span>}
    </span>
  );
}
