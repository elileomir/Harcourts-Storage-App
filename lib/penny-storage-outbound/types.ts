/**
 * Penny Storage Outbound — types & constants
 *
 * Different from `lib/penny-outbound/types.ts` which handles reference checks.
 * This module handles storage waitlist follow-up calls where Penny contacts
 * waitlisted clients to offer available units.
 *
 * Dynamic variable keys must match the Retell storage outbound agent prompt.
 */

// ============================================
// Defaults
// ============================================
export const AGENCY_DEFAULT = "Harcourts Ulverstone and Penguin";

// ============================================
// Form data (camelCase — React state)
// ============================================
export interface StorageOutboundFormData {
  /** Optional: link to waitlist entry for prefill */
  waitlistId: string;
  /** Full name of the client being called */
  clientName: string;
  /** First name — auto-extracted, editable */
  clientFirstname: string;
  /** E.164 phone number */
  toNumber: string;
  /** Facility name — from DB dropdown */
  facilityName: string;
  /** Agency name — defaults to AGENCY_DEFAULT */
  agencyName: string;
  /** Count of available units at selected facility */
  availableUnits: number;
  /** Formatted unit details string */
  unitDetails: string;
}

export const initialStorageOutboundFormData: StorageOutboundFormData = {
  waitlistId: "",
  clientName: "",
  clientFirstname: "",
  toNumber: "",
  facilityName: "",
  agencyName: AGENCY_DEFAULT,
  availableUnits: 0,
  unitDetails: "",
};

// ============================================
// Retell dynamic variables (snake_case — sent to Retell)
// ============================================
export interface StorageRetellDynamicVariables {
  client_name: string;
  client_firstname: string;
  facility_name: string;
  waitlist_id: string;
  agency_name: string;
  available_units: string;
  unit_details: string;
}

// ============================================
// Helpers
// ============================================

/** Extract first name from a full name string */
export function extractFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0];
}

/** Build dynamic variables payload for Retell from form data */
export function buildStorageDynamicVariables(
  formData: StorageOutboundFormData
): StorageRetellDynamicVariables {
  return {
    client_name: formData.clientName,
    client_firstname: formData.clientFirstname || extractFirstName(formData.clientName),
    facility_name: formData.facilityName,
    waitlist_id: formData.waitlistId || "",
    agency_name: formData.agencyName,
    available_units: String(formData.availableUnits),
    unit_details: formData.unitDetails || "No units currently available at this facility.",
  };
}
