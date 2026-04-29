"use client";

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  REFEREE_RELATIONSHIPS,
  LANDLORD_TYPES,
  isLandlordRelationship,
  type PennyOutboundFormData,
  type LandlordType,
  type RefereeRelationship,
} from "@/lib/penny-outbound/types";
import type { FieldErrors } from "@/lib/penny-outbound/validation";

interface RefereeSectionProps {
  formData: PennyOutboundFormData;
  errors: FieldErrors;
  onChange: (patch: Partial<PennyOutboundFormData>) => void;
}

export function RefereeSection({
  formData,
  errors,
  onChange,
}: RefereeSectionProps) {
  const nameId = useId();
  const relId = useId();
  const tenancyAddrId = useId();
  const tenancyTypeId = useId();
  const reduced = useReducedMotion();

  const showTenancy = isLandlordRelationship(formData.refereeRelationship);

  const handleRelationshipChange = (next: RefereeRelationship | "") => {
    // When switching away from a landlord relationship, clear stale conditional
    // values so they never get persisted.
    if (!isLandlordRelationship(next)) {
      onChange({
        refereeRelationship: next,
        tenancyAddress: "",
        tenancyLandlordType: "",
      });
    } else {
      onChange({ refereeRelationship: next });
    }
  };

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referee name */}
        <div>
          <label htmlFor={nameId} className="field-label">
            Referee name <span className="text-red-500">*</span>
          </label>
          <input
            id={nameId}
            type="text"
            value={formData.refereeName}
            onChange={(e) => onChange({ refereeName: e.target.value })}
            aria-invalid={!!errors.refereeName}
            aria-describedby={
              errors.refereeName ? `${nameId}-error` : undefined
            }
            placeholder="Jane Smith"
            className={`form-input ${errors.refereeName ? "border-red-300" : ""}`}
            style={{ textTransform: "none" }}
          />
          {errors.refereeName && (
            <p id={`${nameId}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
              {errors.refereeName}
            </p>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label htmlFor={relId} className="field-label">
            How do they know the applicant? <span className="text-red-500">*</span>
          </label>
          <select
            id={relId}
            value={formData.refereeRelationship}
            onChange={(e) =>
              handleRelationshipChange(e.target.value as RefereeRelationship | "")
            }
            aria-invalid={!!errors.refereeRelationship}
            aria-describedby={
              errors.refereeRelationship ? `${relId}-error` : undefined
            }
            className={`select-field ${
              errors.refereeRelationship ? "border-red-300" : ""
            }`}
            style={{ textTransform: "none" }}
          >
            <option value="">Pick a relationship…</option>
            {REFEREE_RELATIONSHIPS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.refereeRelationship && (
            <p id={`${relId}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
              {errors.refereeRelationship}
            </p>
          )}
        </div>
      </div>

      {/* Conditional tenancy block — only for landlord relationships. */}
      <AnimatePresence initial={false}>
        {showTenancy && (
          <motion.div
            key="tenancy"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={reduced ? undefined : { height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#001F49]">Tenancy details</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Penny mentions this address when speaking to the landlord.
                </p>
              </div>

              <div>
                <label htmlFor={tenancyAddrId} className="field-label">
                  Tenancy address <span className="text-red-500">*</span>
                </label>
                <input
                  id={tenancyAddrId}
                  type="text"
                  value={formData.tenancyAddress}
                  onChange={(e) => onChange({ tenancyAddress: e.target.value })}
                  aria-invalid={!!errors.tenancyAddress}
                  aria-describedby={
                    errors.tenancyAddress ? `${tenancyAddrId}-error` : undefined
                  }
                  placeholder="15 Beach Road, Bondi NSW 2026"
                  className={`form-input ${errors.tenancyAddress ? "border-red-300" : ""}`}
                  style={{ textTransform: "none" }}
                />
                {errors.tenancyAddress && (
                  <p
                    id={`${tenancyAddrId}-error`}
                    role="alert"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {errors.tenancyAddress}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={tenancyTypeId} className="field-label">
                  Referee acts as <span className="text-red-500">*</span>
                </label>
                <select
                  id={tenancyTypeId}
                  value={formData.tenancyLandlordType}
                  onChange={(e) =>
                    onChange({
                      tenancyLandlordType: e.target.value as LandlordType | "",
                    })
                  }
                  aria-invalid={!!errors.tenancyLandlordType}
                  aria-describedby={
                    errors.tenancyLandlordType
                      ? `${tenancyTypeId}-error`
                      : undefined
                  }
                  className={`select-field ${
                    errors.tenancyLandlordType ? "border-red-300" : ""
                  }`}
                  style={{ textTransform: "none" }}
                >
                  <option value="">Pick one…</option>
                  {LANDLORD_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.tenancyLandlordType && (
                  <p
                    id={`${tenancyTypeId}-error`}
                    role="alert"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {errors.tenancyLandlordType}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
