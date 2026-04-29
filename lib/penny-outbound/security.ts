/**
 * Penny Outbound — input sanitisation
 *
 * Mirrors lib/expense-approval/security.ts. Strips HTML/script/javascript:
 * payloads from text fields. Phone-aware: preserves the leading + on toNumber.
 */

import { normalisePhone } from "./validation";
import type { PennyOutboundFormData } from "./types";

function sanitizeString(value: string | null | undefined): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export function sanitizeFormData(formData: PennyOutboundFormData): PennyOutboundFormData {
  return {
    // Phone-aware: strip whitespace/dashes/parens but keep the leading +.
    toNumber: normalisePhone(formData.toNumber ?? ""),

    applicantName: sanitizeString(formData.applicantName),
    propertyAddress: sanitizeString(formData.propertyAddress),
    agencyName: sanitizeString(formData.agencyName),
    refereeName: sanitizeString(formData.refereeName),

    // Enums — let the validator catch bad values; sanitiser just trims.
    refereeRelationship: (sanitizeString(formData.refereeRelationship) ||
      "") as PennyOutboundFormData["refereeRelationship"],
    tenancyLandlordType: (sanitizeString(formData.tenancyLandlordType) ||
      "") as PennyOutboundFormData["tenancyLandlordType"],

    tenancyAddress: sanitizeString(formData.tenancyAddress),
    applicationId: sanitizeString(formData.applicationId),

    callMode: formData.callMode === "web" ? "web" : "phone",
  };
}

/**
 * Build the dynamic_variables payload that gets sent verbatim to Retell.
 * Conditional fields (tenancy_*) are blanked out when not applicable so the
 * agent prompt never interpolates stale data.
 */
import { isLandlordRelationship, type RetellDynamicVariables } from "./types";

export function buildDynamicVariables(
  formData: PennyOutboundFormData
): RetellDynamicVariables {
  const isLandlord = isLandlordRelationship(formData.refereeRelationship);
  return {
    applicant_name: formData.applicantName,
    property_address: formData.propertyAddress,
    agency_name: formData.agencyName,
    referee_name: formData.refereeName,
    referee_relationship: formData.refereeRelationship as RetellDynamicVariables["referee_relationship"],
    tenancy_address: isLandlord ? formData.tenancyAddress : "",
    tenancy_landlord_type: isLandlord ? formData.tenancyLandlordType : "",
    application_id: formData.applicationId || "",
    reference_check_id: "",
  };
}
