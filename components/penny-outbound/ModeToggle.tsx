"use client";

import { Phone, Globe } from "lucide-react";
import type { CallMode } from "@/lib/penny-outbound/types";

interface ModeToggleProps {
  value: CallMode;
  onChange: (next: CallMode) => void;
  disabled?: boolean;
}

const OPTIONS: { value: CallMode; label: string; description: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  {
    value: "phone",
    label: "Phone call",
    description: "Penny dials a real number",
    Icon: Phone,
  },
  {
    value: "web",
    label: "Web test",
    description: "Browser-only — no phone needed",
    Icon: Globe,
  },
];

/**
 * Phone vs Web Test mode picker.
 * Implemented as a radiogroup (semantic, keyboard-friendly: arrow keys move
 * between options, Space activates).
 */
export function ModeToggle({ value, onChange, disabled }: ModeToggleProps) {
  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="field-label">Call mode</legend>
      <div
        role="radiogroup"
        aria-label="Call mode"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue focus-visible:ring-offset-2 ${
                selected
                  ? "border-harcourts-blue bg-harcourts-blue/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                  selected
                    ? "bg-harcourts-blue text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <opt.Icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#001F49]">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
