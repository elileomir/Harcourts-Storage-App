"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline progress trail shown in the conversation while Claude is thinking or
 * running tools. Each step that has passed shows a tick; the current step spins.
 * Lives in the message flow (not a banner) so staff see it in context.
 */
export function WorkingIndicator({ steps }: { steps: string[] }) {
  if (!steps.length) return null;
  const lastIndex = steps.length - 1;

  return (
    <div className="flex" role="status" aria-live="polite">
      <div className="flex flex-col gap-1.5 rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-4 py-3 shadow-sm">
        {steps.map((step, i) => {
          const isCurrent = i === lastIndex;
          return (
            <div key={`${step}-${i}`} className="flex items-center gap-2">
              {isCurrent ? (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-[#00ADEF] motion-reduce:animate-none" aria-hidden />
              ) : (
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-3 w-3 text-emerald-600" aria-hidden />
                </span>
              )}
              <span
                className={cn(
                  "text-sm",
                  isCurrent ? "font-semibold text-[#001F49]" : "text-slate-400",
                )}
              >
                {step}
              </span>
              {isCurrent && (
                <span className="flex gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#00ADEF] [animation-delay:0ms] motion-reduce:animate-none" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#00ADEF] [animation-delay:150ms] motion-reduce:animate-none" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#00ADEF] [animation-delay:300ms] motion-reduce:animate-none" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
