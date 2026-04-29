"use client";

import { useId } from "react";
import { Phone } from "lucide-react";
import { normalisePhone } from "@/lib/penny-outbound/validation";

interface PhoneNumberInputProps {
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * E.164 phone-number input.
 *
 * UX behaviour:
 *   - inputmode="tel" + autocomplete="tel" (mobile gets the right keyboard)
 *   - on blur, strip spaces / dashes / parens and preserve a leading +
 *   - on paste, normalise the pasted value the same way
 *   - never auto-prepend a country code — surfacing intent to the user is safer
 *   - inline error rendered below input with role="alert"
 */
export function PhoneNumberInput({
  value,
  onChange,
  onBlur,
  error,
  disabled,
  required,
}: PhoneNumberInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted) {
      e.preventDefault();
      onChange(normalisePhone(pasted));
    }
  };

  const handleBlur = () => {
    if (value) {
      const normalised = normalisePhone(value);
      if (normalised !== value) onChange(normalised);
    }
    onBlur?.();
  };

  return (
    <div>
      <label htmlFor={id} className="field-label">
        To number {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Phone
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onBlur={handleBlur}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helpId}
          placeholder="+61412345678"
          className={`form-input !pl-9 ${
            error ? "border-red-300 focus:!shadow-[0_0_0_2px_rgba(239,68,68,0.4)]" : ""
          }`}
          style={{ textTransform: "none" }}
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : (
        <p id={helpId} className="mt-1.5 text-xs text-gray-400">
          Must include country/area code. Example: +61 412 345 678 (Mobile) or +61 2 1234 5678 (Landline).
        </p>
      )}
    </div>
  );
}
