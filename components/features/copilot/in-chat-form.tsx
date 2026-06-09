"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  findCountry,
  validateEmail,
  validatePhone,
} from "@/lib/copilot/validation";
import type { FormFieldSpec, FormSpec } from "@/lib/copilot/types";

interface InChatFormProps {
  spec: FormSpec;
  onSubmit: (text: string) => void;
  /** When set (from saved history), the form renders locked with these answers applied. */
  answer?: string;
}

const INPUT_CLASS =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#001F49] outline-none transition focus:border-[#00ADEF] focus:ring-2 focus:ring-[#00ADEF]/20 placeholder:text-slate-400";

function fieldKey(fd: FormFieldSpec, idx: number): string {
  return fd.name || `field${idx}`;
}
function fieldLabel(fd: FormFieldSpec, idx: number): string {
  return fd.label || fieldKey(fd, idx);
}
function fieldType(fd: FormFieldSpec, mode: FormSpec["mode"]): string {
  return (fd.type || (mode === "checklist" ? "checkbox" : "text")).toLowerCase();
}

/** Parse a saved answer ("- Label: value" lines) into a label→value map. */
function parseAnswer(answer: string | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  if (!answer) return map;
  for (const line of answer.split("\n")) {
    const m = line.match(/^-\s*(.+?):\s*(.*)$/);
    if (m) map[m[1].trim()] = m[2].trim();
  }
  return map;
}

export function InChatForm({ spec, onSubmit, answer }: InChatFormProps) {
  const { mode, fields } = spec;
  const answered = parseAnswer(answer);

  // Initial values: saved answer wins, else the field default.
  const initialValues = useMemo(() => {
    const v: Record<string, string> = {};
    const phone: Record<string, string> = {};
    fields.forEach((fd, idx) => {
      const key = fieldKey(fd, idx);
      const label = fieldLabel(fd, idx);
      const type = fieldType(fd, mode);
      const saved = answered[label];
      if (type === "checkbox") {
        const raw = saved ?? fd.default ?? "";
        v[key] = String(raw).toLowerCase() === "yes" ? "Yes" : "No";
      } else if (type === "select") {
        v[key] = saved ?? fd.default ?? fd.options?.[0] ?? "";
      } else {
        v[key] = saved ?? fd.default ?? "";
      }
      if (type === "tel") phone[key] = DEFAULT_COUNTRY;
    });
    return { v, phone };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [values, setValues] = useState<Record<string, string>>(initialValues.v);
  const [phoneCountry, setPhoneCountry] = useState<Record<string, string>>(initialValues.phone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const locked = submitted || answer != null;

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    const nextErrors: Record<string, string> = {};
    const lines: string[] = [];

    fields.forEach((fd, idx) => {
      const key = fieldKey(fd, idx);
      const label = fieldLabel(fd, idx);
      const type = fieldType(fd, mode);
      let display = values[key] ?? "";

      if (type === "tel") {
        const result = validatePhone(values[key] ?? "", phoneCountry[key] ?? DEFAULT_COUNTRY);
        if (values[key]?.trim() || fd.required) {
          if (!result.valid) nextErrors[key] = result.message ?? "Invalid phone number.";
          else display = result.e164;
        }
      } else if (type === "email") {
        if (values[key]?.trim() || fd.required) {
          const err = validateEmail(values[key] ?? "");
          if (err) nextErrors[key] = err;
        }
      } else if (fd.required && !String(values[key] ?? "").trim() && type !== "checkbox") {
        nextErrors[key] = "This is required.";
      }

      lines.push(`- ${label}: ${display || "(blank)"}`);
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitted(true);
    const title = spec.title || (mode === "checklist" ? "Checklist" : "Form");
    onSubmit(`📋 ${title}\n${lines.join("\n")}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "mt-2 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4",
        locked && "opacity-80",
      )}
    >
      {spec.title && <div className="text-sm font-bold text-[#001F49]">{spec.title}</div>}
      {spec.intro && <p className="-mt-1.5 text-xs text-slate-500">{spec.intro}</p>}

      {fields.map((fd, idx) => {
        const key = fieldKey(fd, idx);
        const label = fieldLabel(fd, idx);
        const type = fieldType(fd, mode);
        const err = errors[key];
        const labelId = `cf-${key}-${idx}`;

        if (type === "checkbox") {
          return (
            <label key={key} className="flex items-center gap-2 text-sm font-medium text-[#001F49]">
              <input
                type="checkbox"
                checked={values[key] === "Yes"}
                disabled={locked}
                onChange={(e) => setValue(key, e.target.checked ? "Yes" : "No")}
                className="h-4 w-4 accent-[#00ADEF]"
              />
              {label}
            </label>
          );
        }

        return (
          <div key={key} className="flex flex-col gap-1">
            <label htmlFor={labelId} className="text-xs font-semibold text-[#001F49]">
              {label}
              {fd.required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>

            {type === "select" ? (
              <select
                id={labelId}
                value={values[key]}
                disabled={locked}
                onChange={(e) => setValue(key, e.target.value)}
                className={INPUT_CLASS}
              >
                {(fd.options ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : type === "radio" ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5" role="radiogroup" aria-labelledby={labelId}>
                {(fd.options ?? []).map((o) => (
                  <label key={o} className="flex items-center gap-1.5 text-sm text-[#001F49]">
                    <input
                      type="radio"
                      name={labelId}
                      value={o}
                      checked={values[key] === o}
                      disabled={locked}
                      onChange={() => setValue(key, o)}
                      className="accent-[#00ADEF]"
                    />
                    {o}
                  </label>
                ))}
              </div>
            ) : type === "textarea" ? (
              <textarea
                id={labelId}
                rows={2}
                value={values[key]}
                placeholder={fd.placeholder}
                disabled={locked}
                onChange={(e) => setValue(key, e.target.value)}
                className={cn(INPUT_CLASS, "resize-y")}
              />
            ) : type === "tel" ? (
              <div className="flex gap-2">
                <select
                  aria-label="Country code"
                  value={phoneCountry[key] ?? DEFAULT_COUNTRY}
                  disabled={locked}
                  onChange={(e) => setPhoneCountry((p) => ({ ...p, [key]: e.target.value }))}
                  className={cn(INPUT_CLASS, "w-auto flex-shrink-0")}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.iso2} value={c.iso2}>
                      {c.flag} +{c.dialCode}
                    </option>
                  ))}
                </select>
                <input
                  id={labelId}
                  type="tel"
                  inputMode="tel"
                  value={values[key]}
                  placeholder={fd.placeholder || findCountry(phoneCountry[key] ?? DEFAULT_COUNTRY).name}
                  disabled={locked}
                  onChange={(e) => setValue(key, e.target.value)}
                  className={INPUT_CLASS}
                  aria-invalid={!!err}
                />
              </div>
            ) : (
              <input
                id={labelId}
                type={["number", "date", "email"].includes(type) ? type : "text"}
                value={values[key]}
                placeholder={fd.placeholder}
                disabled={locked}
                onChange={(e) => setValue(key, e.target.value)}
                className={INPUT_CLASS}
                aria-invalid={!!err}
              />
            )}

            {err && <p className="text-xs font-medium text-rose-600">{err}</p>}
          </div>
        );
      })}

      {locked ? (
        <p className="text-xs font-semibold text-emerald-600">✓ Sent</p>
      ) : (
        <button
          type="submit"
          className="self-start rounded-md bg-[#00ADEF] px-4 py-2 text-sm font-bold text-white transition hover:brightness-105"
        >
          {spec.submitLabel || (mode === "checklist" ? "Submit checklist" : "Send")}
        </button>
      )}
    </form>
  );
}
