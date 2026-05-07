/**
 * Penny Storage Outbound — form validation
 *
 * Reuses phone normalisation from the reference outbound module.
 */

import type { StorageOutboundFormData } from "./types";

export type FieldErrors = Partial<Record<keyof StorageOutboundFormData, string>>;

export interface ValidationResult {
  valid: boolean;
  errors: FieldErrors;
  firstError?: string;
}

/** Normalise AU phone: strip spaces/dashes/parens, keep leading + */
export function normalisePhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, "").trim();
}

/** Validate E.164 international phone number (any country code) */
function isValidE164Phone(phone: string): boolean {
  const normalised = normalisePhone(phone);
  // E.164: + followed by 7–15 digits (covers all countries)
  return /^\+\d{7,15}$/.test(normalised);
}

/** Mask phone for display: +61412345678 → +61 4•• ••• 678 */
export function maskPhone(phone: string): string {
  const n = normalisePhone(phone);
  if (n.length < 6) return n;
  return n.slice(0, 4) + " " + n.slice(4, 5) + "•• ••• " + n.slice(-3);
}

export function validateForm(formData: StorageOutboundFormData): ValidationResult {
  const errors: FieldErrors = {};

  // Client name — required
  if (!formData.clientName.trim()) {
    errors.clientName = "Client name is required";
  }

  // Phone number — required and valid AU format
  if (!formData.toNumber.trim()) {
    errors.toNumber = "Phone number is required";
  } else if (!isValidE164Phone(formData.toNumber)) {
    errors.toNumber = "Enter a valid international number starting with + (e.g. +61412345678 or +639665971704)";
  }

  // Facility — required
  if (!formData.facilityName.trim()) {
    errors.facilityName = "Select a facility";
  }

  // Agency — required
  if (!formData.agencyName.trim()) {
    errors.agencyName = "Agency name is required";
  }

  const keys = Object.keys(errors) as (keyof FieldErrors)[];
  return {
    valid: keys.length === 0,
    errors,
    firstError: keys.length > 0 ? errors[keys[0]] : undefined,
  };
}
