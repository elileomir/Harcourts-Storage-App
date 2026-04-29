"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, PhoneCall, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import {
  initialPennyOutboundFormData,
  type PennyOutboundFormData,
} from "@/lib/penny-outbound/types";
import { validateForm, maskPhone, type FieldErrors } from "@/lib/penny-outbound/validation";
import { submitPennyOutbound } from "@/lib/penny-outbound/api";

import { ModeToggle } from "./ModeToggle";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { RefereeSection } from "./RefereeSection";

export function CallForm() {
  const [formData, setFormData] = useState<PennyOutboundFormData>(
    initialPennyOutboundFormData
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const applicantId = useId();
  const propertyId = useId();
  const agencyId = useId();
  const applicationId = useId();

  const update = (patch: Partial<PennyOutboundFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    // Clear errors for any field being changed.
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof PennyOutboundFormData)[]) {
        delete next[key];
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const validation = validateForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      // Focus the first error field.
      const firstKey = Object.keys(validation.errors)[0];
      if (firstKey) {
        const el = document.querySelector(
          `[aria-invalid="true"]`
        ) as HTMLElement | null;
        el?.focus();
      }
      return;
    }

    setSubmitting(true);
    const callingMessage =
      formData.callMode === "web"
        ? "Starting Penny's web call…"
        : `Penny is calling ${maskPhone(formData.toNumber)}`;
    const toastId = toast.loading(callingMessage);

    const result = await submitPennyOutbound(formData);

    if (result.success) {
      toast.success(
        formData.callMode === "web"
          ? "Web call ready — see History for the access link."
          : `Penny is calling ${maskPhone(formData.toNumber)}`,
        { id: toastId }
      );
      // Reset to defaults so the next call starts fresh, but keep agency.
      setFormData({
        ...initialPennyOutboundFormData,
        agencyName: formData.agencyName,
        callMode: formData.callMode,
      });
      setErrors({});
    } else if (result.fieldErrors) {
      setErrors(result.fieldErrors as FieldErrors);
      toast.error("Please check the highlighted fields", { id: toastId });
    } else {
      toast.error("Penny couldn't dial", {
        id: toastId,
        description: result.error?.slice(0, 200),
      });
    }
    setSubmitting(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6"
      noValidate
    >
      {/* Mode */}
      <ModeToggle
        value={formData.callMode}
        onChange={(callMode) => update({ callMode })}
        disabled={submitting}
      />

      {/* Phone number — only when phone mode. Web mode skips this. */}
      {formData.callMode === "phone" && (
        <PhoneNumberInput
          value={formData.toNumber}
          onChange={(toNumber) => update({ toNumber })}
          error={errors.toNumber}
          disabled={submitting}
          required
        />
      )}

      {/* Applicant + Property */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={applicantId} className="field-label">
            Applicant name <span className="text-red-500">*</span>
          </label>
          <input
            id={applicantId}
            type="text"
            value={formData.applicantName}
            onChange={(e) => update({ applicantName: e.target.value })}
            disabled={submitting}
            aria-invalid={!!errors.applicantName}
            aria-describedby={
              errors.applicantName ? `${applicantId}-error` : undefined
            }
            placeholder="Brad Reeves"
            className={`form-input ${errors.applicantName ? "border-red-300" : ""}`}
            style={{ textTransform: "none" }}
          />
          {errors.applicantName && (
            <p id={`${applicantId}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
              {errors.applicantName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={propertyId} className="field-label">
            Property address <span className="text-red-500">*</span>
          </label>
          <input
            id={propertyId}
            type="text"
            value={formData.propertyAddress}
            onChange={(e) => update({ propertyAddress: e.target.value })}
            disabled={submitting}
            aria-invalid={!!errors.propertyAddress}
            aria-describedby={
              errors.propertyAddress ? `${propertyId}-error` : undefined
            }
            placeholder="42 Harbour View Drive, Manly NSW 2095"
            className={`form-input ${errors.propertyAddress ? "border-red-300" : ""}`}
            style={{ textTransform: "none" }}
          />
          {errors.propertyAddress && (
            <p id={`${propertyId}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
              {errors.propertyAddress}
            </p>
          )}
        </div>
      </div>

      {/* Agency */}
      <div>
        <label htmlFor={agencyId} className="field-label">
          Agency <span className="text-red-500">*</span>
        </label>
        <input
          id={agencyId}
          type="text"
          value={formData.agencyName}
          onChange={(e) => update({ agencyName: e.target.value })}
          disabled={submitting}
          aria-invalid={!!errors.agencyName}
          aria-describedby={
            errors.agencyName ? `${agencyId}-error` : `${agencyId}-help`
          }
          className={`form-input ${errors.agencyName ? "border-red-300" : ""}`}
          style={{ textTransform: "none" }}
        />
        {errors.agencyName ? (
          <p id={`${agencyId}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
            {errors.agencyName}
          </p>
        ) : (
          <p id={`${agencyId}-help`} className="mt-1.5 text-xs text-gray-400">
            Defaults to Harcourts Ulverstone Penguin. Edit if you&apos;re calling on behalf of another agency.
          </p>
        )}
      </div>

      {/* Referee + conditional tenancy */}
      <RefereeSection formData={formData} errors={errors} onChange={update} />

      {/* Optional: Application ID */}
      <details className="group">
        <summary className="text-sm font-semibold text-gray-600 cursor-pointer select-none hover:text-gray-900 transition-colors">
          Optional details
        </summary>
        <div className="mt-3">
          <label htmlFor={applicationId} className="field-label">
            Application ID
          </label>
          <input
            id={applicationId}
            type="text"
            value={formData.applicationId}
            onChange={(e) => update({ applicationId: e.target.value })}
            disabled={submitting}
            placeholder="APP-2026-0042"
            className="form-input"
            style={{ textTransform: "none" }}
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Pasted into Penny&apos;s notes for cross-referencing the 2apply application.
          </p>
        </div>
      </details>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Link
          href="/dashboard/penny-outbound-history"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue focus-visible:ring-offset-2 rounded-lg"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-harcourts-blue hover:bg-harcourts-blue-dark text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue focus-visible:ring-offset-2 min-h-[44px]"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Calling…
            </>
          ) : (
            <>
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              Call Penny
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
