/**
 * Penny Outbound — types & constants
 *
 * Penny is the voice AI agent (Retell). The form gathers dynamic variables
 * that get interpolated into Penny's conversation flow at runtime.
 *
 * IMPORTANT: dynamic_variables keys must match what the Retell agent prompt
 * expects — do not rename them. They are sent verbatim as
 * `retell_llm_dynamic_variables` in the Retell create-phone-call body.
 */

// ============================================
// Enums / unions
// ============================================
export type RefereeRelationship =
  | "previous landlord"
  | "current employer"
  | "personal friend";

export type LandlordType = "landlord" | "agent";

export type CallMode = "phone" | "web";

export type RetellCallStatus =
  | "initiating"
  | "registered"
  | "ongoing"
  | "ended"
  | "failed";

// ============================================
// Public option lists (for selects)
// ============================================
export const REFEREE_RELATIONSHIPS: { value: RefereeRelationship; label: string }[] = [
  { value: "previous landlord", label: "Previous landlord" },
  { value: "current employer", label: "Current employer" },
  { value: "personal friend", label: "Personal friend" },
];

export const LANDLORD_TYPES: { value: LandlordType; label: string }[] = [
  { value: "landlord", label: "Landlord (direct)" },
  { value: "agent", label: "Agent (managing on behalf)" },
];

// ============================================
// Defaults
// ============================================
export const AGENCY_DEFAULT = "Harcourts Ulverstone Penguin";

// ============================================
// Form data (camelCase — used in React state)
// ============================================
export interface PennyOutboundFormData {
  toNumber: string;             // E.164 e.g. +61412345678 (only required when callMode = "phone")
  applicantName: string;
  propertyAddress: string;
  agencyName: string;           // defaults to AGENCY_DEFAULT
  refereeName: string;
  refereeRelationship: RefereeRelationship | "";
  tenancyAddress: string;       // only relevant for landlord relationship
  tenancyLandlordType: LandlordType | "";
  applicationId: string;        // optional
  callMode: CallMode;
}

export const initialPennyOutboundFormData: PennyOutboundFormData = {
  toNumber: "",
  applicantName: "",
  propertyAddress: "",
  agencyName: AGENCY_DEFAULT,
  refereeName: "",
  refereeRelationship: "",
  tenancyAddress: "",
  tenancyLandlordType: "",
  applicationId: "",
  callMode: "phone",
};

// ============================================
// Retell dynamic variables (snake_case — sent verbatim to Retell)
// Mirrors the Node script keys exactly.
// ============================================
export interface RetellDynamicVariables {
  applicant_name: string;
  property_address: string;
  agency_name: string;
  referee_name: string;
  referee_relationship: RefereeRelationship;
  tenancy_address: string;            // "" when not applicable
  tenancy_landlord_type: LandlordType | "";
  application_id: string;
  reference_check_id: string;         // reserved for future — always "" for now
}

// ============================================
// DB row shape (snake_case — matches Postgres columns)
// ============================================
export interface PennyOutboundCallRow {
  id: string;
  user_id: string | null;
  to_number: string;
  applicant_name: string;
  property_address: string;
  agency_name: string;
  referee_name: string;
  referee_relationship: RefereeRelationship;
  tenancy_address: string | null;
  tenancy_landlord_type: LandlordType | null;
  application_id: string | null;
  call_mode: CallMode;
  retell_call_id: string | null;
  retell_call_status: RetellCallStatus | string;
  error_message: string | null;
  dynamic_variables: RetellDynamicVariables;
  created_at: string;
  updated_at: string;
}

// ============================================
// Helpers
// ============================================
export function isLandlordRelationship(rel: RefereeRelationship | ""): boolean {
  return typeof rel === "string" && rel.includes("landlord");
}
