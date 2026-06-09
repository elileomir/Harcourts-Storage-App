"use client";

import { Loader2 } from "lucide-react";
import { previewFormFromPartial } from "@/lib/copilot/markdown";

interface PendingFormProps {
  /** The partial (still-streaming) ```form/```checklist block text. */
  partial?: string;
  mode: "form" | "checklist";
}

/**
 * A live skeleton of the form as it streams in. Field labels that have already
 * arrived in the partial JSON are shown with a shimmering input placeholder;
 * trailing shimmer rows hint that more is on the way. Replaced by the real,
 * interactive form the moment the block closes.
 */
export function PendingForm({ partial, mode }: PendingFormProps) {
  const { title, labels } = previewFormFromPartial(partial);
  // Always suggest at least a couple of rows so it reads as "a form is forming".
  const ghostRows = Math.max(0, (labels.length > 0 ? 1 : 2));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Preparing a ${mode}`}
      className="mt-2 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-[#001F49]">
        <Loader2 className="h-4 w-4 animate-spin text-[#00ADEF] motion-reduce:animate-none" aria-hidden />
        {title || (mode === "checklist" ? "Preparing a checklist…" : "Preparing a form…")}
      </div>

      {labels.map((label, i) => (
        <div key={`${label}-${i}`} className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#001F49]">{label}</span>
          <span className="h-9 w-full animate-pulse rounded-md bg-slate-200/70 motion-reduce:animate-none" />
        </div>
      ))}

      {Array.from({ length: ghostRows }).map((_, i) => (
        <div key={`ghost-${i}`} className="flex flex-col gap-1">
          <span className="h-3 w-28 animate-pulse rounded bg-slate-200/70 motion-reduce:animate-none" />
          <span className="h-9 w-full animate-pulse rounded-md bg-slate-200/60 motion-reduce:animate-none" />
        </div>
      ))}

      <span className="h-9 w-24 animate-pulse rounded-md bg-[#00ADEF]/25 motion-reduce:animate-none" />
    </div>
  );
}
