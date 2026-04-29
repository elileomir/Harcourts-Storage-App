/**
 * Penny Outbound — form validation
 *
 * Mirrors the lightweight validation pattern used in lib/expense-approval/security.ts
 * (no Zod, no external deps — plain TS functions returning { valid, error }).
 */

import {
  isLandlordRelationship,
  type PennyOutboundFormData,
  type RefereeRelationship,
} from "./types";

// E.164: leading +, then 8–15 digits (first must be 1–9).
// https://en.wikipedia.org/wiki/E.164
export const E164_RE = /^\+[1-9]\d{7,14}$/;

export type FieldErrors = Partial<
  Record<keyof PennyOutboundFormData, string>
>;

export interface ValidationResult {
  valid: boolean;
  errors: FieldErrors;
  // First error string (used for API response shorthand).
  firstError?: string;
}

/**
 * Strip user-friendly separators ("+61 412 345-678" → "+61412345678").
 * Does NOT auto-prepend a country code — that's an explicit user choice.
 */
export function normalisePhone(raw: string): string {
  if (!raw) return "";
  // Keep one leading +, drop everything that isn't a digit.
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^0-9]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

const VALID_RELATIONSHIPS: RefereeRelationship[] = [
  "previous landlord",
  "current employer",
  "personal friend",
];

export function validateForm(formData: PennyOutboundFormData): ValidationResult {
  const errors: FieldErrors = {};

  if (!formData.applicantName.trim()) {
    errors.applicantName = "Applicant name is required";
  }
  if (!formData.propertyAddress.trim()) {
    errors.propertyAddress = "Property address is required";
  }
  if (!formData.agencyName.trim()) {
    errors.agencyName = "Agency name is required";
  }
  if (!formData.refereeName.trim()) {
    errors.refereeName = "Referee name is required";
  }
  if (!formData.refereeRelationship) {
    errors.refereeRelationship = "Pick how the referee knows the applicant";
  } else if (!VALID_RELATIONSHIPS.includes(formData.refereeRelationship)) {
    errors.refereeRelationship = "Invalid relationship";
  }

  // Conditional: tenancy fields only required for landlord relationship.
  if (isLandlordRelationship(formData.refereeRelationship)) {
    if (!formData.tenancyAddress.trim()) {
      errors.tenancyAddress = "Tenancy address is required for a landlord referee";
    }
    if (!formData.tenancyLandlordType) {
      errors.tenancyLandlordType = "Pick whether the referee is a landlord or agent";
    }
  }

  // Phone number only required for phone-call mode.
  if (formData.callMode === "phone") {
    const normalised = normalisePhone(formData.toNumber);
    if (!normalised) {
      errors.toNumber = "Phone number is required";
    } else if (!normalised.startsWith("+")) {
      errors.toNumber = "Must start with a country code (e.g. +61 for Australia)";
    } else if (normalised.startsWith("+61") && normalised.length !== 12) {
      errors.toNumber = "Australian numbers must have exactly 9 digits after +61 (including area code)";
    } else if (!E164_RE.test(normalised)) {
      errors.toNumber = "Please enter a valid phone number including country and area code";
    }
  }

  const firstError = Object.values(errors)[0];
  return { valid: Object.keys(errors).length === 0, errors, firstError };
}

/**
 * Mask middle digits of a phone number for log/toast display.
 * "+61412345678" → "+614 ••• 5678"
 */
export function maskPhone(phone: string): string {
  const n = normalisePhone(phone);
  if (n.length <= 7) return n;
  const head = n.slice(0, 4);
  const tail = n.slice(-4);
  return `${head} ••• ${tail}`;
}
