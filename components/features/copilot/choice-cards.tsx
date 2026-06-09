"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChoiceQuestion } from "@/lib/copilot/types";

interface ChoiceCardsProps {
  questions: ChoiceQuestion[];
  onSubmit: (text: string) => void;
  /** When set (from saved history), the widget renders locked with this answer applied. */
  answer?: string;
}

/**
 * <AskUserQuestion> rendered as click-to-choose cards — the default, lowest-friction
 * way Claude gathers a decision. A single question submits on click; multiple
 * questions collect selections then submit together.
 */
export function ChoiceCards({ questions, onSubmit, answer }: ChoiceCardsProps) {
  const single = questions.length === 1;
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [hint, setHint] = useState(false);

  const locked = submitted || answer != null;

  // Resolve which label is chosen for a question: live selection, else parsed from a saved answer.
  const chosen = useMemo(() => {
    if (answer == null) return selected;
    const map: Record<number, string> = {};
    questions.forEach((q, qi) => {
      const match = q.options.find((o) => answer.includes(o.label));
      if (match) map[qi] = match.label;
    });
    return map;
  }, [answer, questions, selected]);

  const pick = (qi: number, label: string) => {
    if (locked) return;
    const next = { ...selected, [qi]: label };
    setSelected(next);
    setHint(false);
    if (single) submit(next);
  };

  const submit = (sel: Record<number, string>) => {
    for (let qi = 0; qi < questions.length; qi++) {
      if (!sel[qi]) {
        setHint(true);
        return;
      }
    }
    const text = single
      ? sel[0]
      : "My choices:\n" +
        questions.map((q, qi) => `- ${q.header || q.question || "Answer"}: ${sel[qi]}`).join("\n");
    setSubmitted(true);
    onSubmit(text);
  };

  return (
    <div className={cn("mt-2 space-y-4", locked && "opacity-80")}>
      {questions.map((q, qi) => (
        <div key={qi} role="group" aria-label={q.question || q.header}>
          <p className="mb-1.5 text-sm font-semibold text-[#001F49]">
            {q.question || q.header || "Choose one"}
          </p>
          <div className="flex flex-col gap-2">
            {q.options.map((o, oi) => {
              const isSel = chosen[qi] === o.label;
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={locked}
                  aria-pressed={isSel}
                  onClick={() => pick(qi, o.label)}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-xl border px-3.5 py-2.5 text-left transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ADEF] focus-visible:ring-offset-1",
                    isSel
                      ? "border-[#00ADEF] bg-sky-50 ring-2 ring-[#00ADEF]/25"
                      : "border-slate-200 bg-white hover:border-[#00ADEF] hover:bg-sky-50/50",
                    locked && "cursor-default",
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#001F49]">{o.label}</span>
                    {isSel && <Check className="h-4 w-4 flex-shrink-0 text-[#00ADEF]" aria-hidden />}
                  </span>
                  {o.description && (
                    <span className="text-xs leading-relaxed text-slate-500">{o.description}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!single && !locked && (
        <button
          type="button"
          onClick={() => submit(selected)}
          className="rounded-md bg-[#00ADEF] px-4 py-2 text-sm font-bold text-white transition hover:brightness-105"
        >
          {hint ? "Please choose…" : "Send"}
        </button>
      )}
      {locked && <p className="text-xs font-semibold text-emerald-600">✓ Sent</p>}
    </div>
  );
}
