"use client";

import { useId, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  PhoneCall,
  X,
  Phone,
  Users,
  Building2,
  Boxes,
  ChevronDown,
  CheckCircle2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import {
  initialStorageOutboundFormData,
  extractFirstName,
  type StorageOutboundFormData,
} from "@/lib/penny-storage-outbound/types";
import {
  validateForm,
  maskPhone,
  normalisePhone,
  type FieldErrors,
} from "@/lib/penny-storage-outbound/validation";
import { submitStorageOutbound } from "@/lib/penny-storage-outbound/api";
import {
  useStorageOutboundData,
  formatUnitDetails,
  type WaitlistOption,
} from "@/hooks/use-storage-outbound-data";

export function StorageCallForm() {
  const [formData, setFormData] = useState<StorageOutboundFormData>(
    initialStorageOutboundFormData
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    waitlistEntries,
    waitlistLoading,
    facilities,
    availableUnits,
    availableCount,
    selectFacility,
    isLoading: dataLoading,
  } = useStorageOutboundData();

  // Unique IDs for accessibility
  const clientNameId = useId();
  const clientFirstnameId = useId();
  const phoneId = useId();
  const phoneErrorId = `${phoneId}-error`;
  const phoneHelpId = `${phoneId}-help`;
  const facilityId = useId();
  const agencyId = useId();
  const unitDetailsId = useId();

  const update = (patch: Partial<StorageOutboundFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof StorageOutboundFormData)[]) {
        delete next[key];
      }
      return next;
    });
  };

  // When facility changes, update available units count + details
  useEffect(() => {
    if (formData.facilityName) {
      selectFacility(formData.facilityName);
    }
  }, [formData.facilityName, selectFacility]);

  useEffect(() => {
    update({
      availableUnits: availableCount,
      unitDetails: formatUnitDetails(availableUnits, formData.facilityName),
    });
  }, [availableCount, availableUnits, formData.facilityName]);

  // Auto-extract first name when full name changes
  useEffect(() => {
    if (formData.clientName) {
      const first = extractFirstName(formData.clientName);
      if (first && formData.clientFirstname !== first) {
        update({ clientFirstname: first });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.clientName]);

  // Select a waitlist entry → prefill fields
  const handleWaitlistSelect = (entry: WaitlistOption) => {
    update({
      waitlistId: entry.id,
      clientName: entry.fullName,
      clientFirstname: extractFirstName(entry.fullName),
      toNumber: entry.phoneNumber,
      facilityName: entry.facility,
    });
    setSearchQuery(entry.fullName);
    setShowDropdown(false);
  };

  // Filtered waitlist entries for search
  const filteredEntries = waitlistEntries.filter((e) =>
    e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.phoneNumber.includes(searchQuery)
  );

  // Handle phone paste (normalise)
  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted) {
      e.preventDefault();
      update({ toNumber: normalisePhone(pasted) });
    }
  };

  const handlePhoneBlur = () => {
    if (formData.toNumber) {
      const normalised = normalisePhone(formData.toNumber);
      if (normalised !== formData.toNumber) update({ toNumber: normalised });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const validation = validateForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      const el = document.querySelector(
        `[aria-invalid="true"]`
      ) as HTMLElement | null;
      el?.focus();
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(
      `Penny is calling ${maskPhone(formData.toNumber)} about ${formData.facilityName}…`
    );

    const result = await submitStorageOutbound(formData);

    if (result.success) {
      toast.success(
        `Penny is calling ${formData.clientFirstname || formData.clientName} at ${maskPhone(formData.toNumber)}`,
        { id: toastId, description: `Regarding ${formData.facilityName}` }
      );
      // Reset form but keep agency
      setFormData({
        ...initialStorageOutboundFormData,
        agencyName: formData.agencyName,
      });
      setErrors({});
      setSearchQuery("");
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
      {/* === Waitlist Selector === */}
      <div className="relative">
        <label className="field-label flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          Select from waitlist
          <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            disabled={submitting || waitlistLoading}
            placeholder={waitlistLoading ? "Loading waitlist…" : "Search by name or phone…"}
            className="form-input !pl-9"
            style={{ textTransform: "none" }}
          />
        </div>

        <AnimatePresence>
          {showDropdown && filteredEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto"
            >
              {filteredEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleWaitlistSelect(entry)}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex items-center justify-between gap-3 border-b border-gray-50 last:border-b-0 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {entry.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {entry.phoneNumber} · {entry.facility || "No facility"}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    entry.status === "Pending"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {entry.status}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {formData.waitlistId && (
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Linked to waitlist entry</span>
            <button
              type="button"
              onClick={() => {
                update({ waitlistId: "", clientName: "", clientFirstname: "", toNumber: "", facilityName: "" });
                setSearchQuery("");
              }}
              className="ml-auto text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* === Divider === */}
      <div className="border-t border-gray-100" />

      {/* === Phone Number === */}
      <div>
        <label htmlFor={phoneId} className="field-label">
          To number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id={phoneId}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={formData.toNumber}
            onChange={(e) => update({ toNumber: e.target.value })}
            onPaste={handlePhonePaste}
            onBlur={handlePhoneBlur}
            disabled={submitting}
            aria-invalid={!!errors.toNumber}
            aria-describedby={errors.toNumber ? phoneErrorId : phoneHelpId}
            placeholder="+61412345678"
            className={`form-input !pl-9 ${
              errors.toNumber ? "border-red-300 focus:!shadow-[0_0_0_2px_rgba(239,68,68,0.4)]" : ""
            }`}
            style={{ textTransform: "none" }}
          />
        </div>
        {errors.toNumber ? (
          <p id={phoneErrorId} role="alert" className="mt-1.5 text-xs text-red-600">
            {errors.toNumber}
          </p>
        ) : (
          <p id={phoneHelpId} className="mt-1.5 text-xs text-gray-400">
            International format with country code. E.g. +61 412 345 678 (AU) or +63 966 597 1704 (PH).
          </p>
        )}
      </div>

      {/* === Client Name + First Name === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={clientNameId} className="field-label">
            Client full name <span className="text-red-500">*</span>
          </label>
          <input
            id={clientNameId}
            type="text"
            value={formData.clientName}
            onChange={(e) => update({ clientName: e.target.value })}
            disabled={submitting}
            aria-invalid={!!errors.clientName}
            aria-describedby={errors.clientName ? `${clientNameId}-error` : undefined}
            placeholder="John Michael Smith"
            className={`form-input ${errors.clientName ? "border-red-300" : ""}`}
            style={{ textTransform: "none" }}
          />
          {errors.clientName && (
            <p id={`${clientNameId}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
              {errors.clientName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={clientFirstnameId} className="field-label">
            First name <span className="text-xs font-normal text-gray-400">(auto-detected)</span>
          </label>
          <input
            id={clientFirstnameId}
            type="text"
            value={formData.clientFirstname}
            onChange={(e) => update({ clientFirstname: e.target.value })}
            disabled={submitting}
            placeholder="John"
            className="form-input"
            style={{ textTransform: "none" }}
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Used by Penny as a friendly greeting. Edit if needed.
          </p>
        </div>
      </div>

      {/* === Facility + Agency === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={facilityId} className="field-label">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 inline mr-1.5" aria-hidden="true" />
            Facility <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id={facilityId}
              value={formData.facilityName}
              onChange={(e) => update({ facilityName: e.target.value })}
              disabled={submitting || dataLoading}
              aria-invalid={!!errors.facilityName}
              aria-describedby={errors.facilityName ? `${facilityId}-error` : undefined}
              className={`form-input appearance-none pr-10 ${
                errors.facilityName ? "border-red-300" : ""
              } ${!formData.facilityName ? "text-gray-400" : ""}`}
            >
              <option value="">
                {dataLoading ? "Loading facilities…" : "Select a facility"}
              </option>
              {facilities.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
          </div>
          {errors.facilityName && (
            <p id={`${facilityId}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
              {errors.facilityName}
            </p>
          )}
        </div>

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
            aria-describedby={errors.agencyName ? `${agencyId}-error` : `${agencyId}-help`}
            className={`form-input ${errors.agencyName ? "border-red-300" : ""}`}
            style={{ textTransform: "none" }}
          />
          {errors.agencyName ? (
            <p id={`${agencyId}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
              {errors.agencyName}
            </p>
          ) : (
            <p id={`${agencyId}-help`} className="mt-1.5 text-xs text-gray-400">
              Defaults to Harcourts. Edit if calling on behalf of another agency.
            </p>
          )}
        </div>
      </div>

      {/* === Available Units Badge === */}
      <AnimatePresence>
        {formData.facilityName && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Boxes className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-900">
                  {availableCount} unit{availableCount !== 1 ? "s" : ""} available at {formData.facilityName}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Penny will mention {availableCount === 0 ? "no availability" : `these ${availableCount} unit${availableCount !== 1 ? "s" : ""}`} in the call.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Unit Details (editable) === */}
      {formData.facilityName && (
        <div>
          <label htmlFor={unitDetailsId} className="field-label">
            Unit details for Penny
          </label>
          <textarea
            id={unitDetailsId}
            value={formData.unitDetails}
            onChange={(e) => update({ unitDetails: e.target.value })}
            disabled={submitting}
            rows={Math.min(Math.max(availableCount, 2), 6)}
            placeholder="Auto-generated from available units…"
            className="form-input resize-y font-mono text-xs leading-relaxed"
            style={{ textTransform: "none" }}
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Auto-filled from database. Edit to customise what Penny tells the client.
          </p>
        </div>
      )}

      {/* === Footer Actions === */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Link
          href="/dashboard/waitlist"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harcourts-blue focus-visible:ring-offset-2 rounded-lg"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 min-h-[44px]"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Calling…
            </>
          ) : (
            <>
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              Let Penny Call
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
