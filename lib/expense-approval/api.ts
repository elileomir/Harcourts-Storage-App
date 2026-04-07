/**
 * Expense Approval API — Payload Builder & Submit
 * Builds the n8n webhook payload and handles submission
 */

import type { ExpenseApprovalFormData } from "./types";

const EXPENSE_WEBHOOK_URL = process.env.N8N_EXPENSE_WEBHOOK_URL || "https://hup.app.n8n.cloud/webhook/landlord-expense";

// ============================================
// Owner Payload Shape (mirrors PurchaserPayload)
// ============================================
interface OwnerPayload {
    full_name: string | null;
    full_name_id: string | null;
    full_name_trustee: string | null;
    full_name_val: string | null;
    email: string | null;
    email_val: string | null;
    mobile: string | null;
    mobile_countrycode: string | null;
    mobile_number: string | null;
    phone: string | null;
    street: string | null;
    suburb: string | null;
    state: string | null;
    postcode: string | null;
    address_full: string | null;
}

// ============================================
// Submission Payload
// ============================================
export interface ExpenseApprovalPayload {
    // Maestro Routing (computed — pass directly to DocuSign Maestro)
    doc_routing: "rates_only" | "taswater_only" | "both";
    service_combo: "C" | "L" | "T" | "CL" | "CT" | "LT" | "CLT";

    // Property
    property_street: string | null;
    property_suburb: string | null;
    property_state: string | null;
    property_postcode: string | null;
    property_address_full: string | null;
    property_pid: string | null;

    // Services
    council_rates: string;
    land_tax: string;
    taswater: string;

    // DocuSign display fields — dot trick (".") for section visibility
    has_rates: string;
    has_land: string;

    // DocuSign display fields — TasWater checkmark trick ("✓") for checkboxes
    has_second_authorisation: string;
    has_change_ownership: string;
    trade_waste_information_only: string;
    authorisation_account_holder_1: string;
    authorisation_other_1: string;
    authorisation_other_details_1: string;
    authorisation_account_holder_2: string;
    authorisation_other_2: string;
    authorisation_other_details_2: string;

    // Ownership structure
    ownership_structure: string;
    ownership_type: string;
    ownership_subtype: string | null;
    owner_count: number;
    trust_name: string | null;
    company_name: string | null;
    company_acn: string | null;
    company_name_acn: string | null;
    all_owners_names: string;
    all_owners_names_trust: string | null;
    all_owners_first_names: string;
    all_owners_email: string;
    owner_1: OwnerPayload;
    owner_2: OwnerPayload;
    owner_3: OwnerPayload;
    owner_4: OwnerPayload;

    // Document uploads
    asic_register_file_name: string | null;
    asic_register_file_base64: string | null;
    trust_schedule_file_name: string | null;
    trust_schedule_file_base64: string | null;

    // TasWater specific (always present, null if not applicable)
    taswater_account_no: string | null;
    taswater_account_name: string | null;
    taswater_postal_street: string | null;
    taswater_postal_suburb: string | null;
    taswater_postal_state: string | null;
    taswater_postal_postcode: string | null;
    taswater_cancel_bpay: string;
    taswater_cancel_direct_debit: string;
    taswater_change_ownership: string;
    taswater_settlement_date: string | null;
}

// ============================================
// Helper: Build empty owner payload
// ============================================
function createNullOwner(): OwnerPayload {
    return {
        full_name: null,
        full_name_id: null,
        full_name_trustee: null,
        full_name_val: null,
        email: null,
        email_val: null,
        mobile: null,
        mobile_countrycode: null,
        mobile_number: null,
        phone: null,
        street: null,
        suburb: null,
        state: null,
        postcode: null,
        address_full: null,
    };
}

// ============================================
// Build Payload
// ============================================
export function buildExpenseApprovalPayload(formData: ExpenseApprovalFormData): ExpenseApprovalPayload {
    const toUpper = (value: string): string => value.toUpperCase();

    const formatOwnerMobile = (index: number): string | null => {
        const o = formData.owners[index];
        if (!o || !o.mobileNumber) return null;
        const cleaned = o.mobileNumber.replace(/[\s-]/g, "");
        return `${o.mobileCountryCode || ""} ${cleaned}`.trim();
    };

    // Trust Name Logic
    let effectiveTrustName: string | null = null;
    if (formData.ownershipStructure === "Trust") {
        let rawTrustName = formData.trustName.trim();
        if (!rawTrustName.toUpperCase().endsWith("TRUST")) {
            rawTrustName = `${rawTrustName} TRUST`;
        }
        effectiveTrustName = rawTrustName;
    }
    const trustNameUpper = effectiveTrustName ? toUpper(effectiveTrustName) : null;

    // Company Name ACN Computed
    const companyNameAcnComputed: string | null =
        formData.companyName && formData.companyACN
            ? (() => {
                const acn = formData.companyACN.replace(/[^0-9]/g, "");
                const formattedAcn = acn.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
                const baseStr = `${toUpper(formData.companyName)} (ACN ${formattedAcn})`;
                return trustNameUpper
                    ? `${baseStr} AS TRUSTEE FOR ${trustNameUpper}`
                    : baseStr;
            })()
            : null;

    // All Owners Names Trust Computed
    const allOwnersNamesTrustComputed: string | null = trustNameUpper
        ? (() => {
            const names = formData.owners
                .slice(0, formData.ownerCount)
                .map((o) => toUpper(o.fullName))
                .filter(Boolean);

            if (names.length === 0) return null;

            let joinedNames = "";
            if (names.length === 1) {
                joinedNames = names[0];
            } else if (names.length === 2) {
                joinedNames = `${names[0]} AND ${names[1]}`;
            } else {
                const last = names.pop();
                joinedNames = `${names.join(", ")} AND ${last}`;
            }

            const suffixText = formData.ownerCount > 1 ? "AS TRUSTEES FOR" : "AS TRUSTEE FOR";
            return `${joinedNames} ${suffixText} ${trustNameUpper}`;
        })()
        : null;

    // Get Full Name Val
    const getFullNameVal = (index: number): string | null => {
        if (formData.ownershipStructure === "Individual") {
            const o = formData.owners[index];
            return o ? toUpper(o.fullName) : null;
        } else if (index === 0) {
            if (formData.ownershipStructure === "Trust" && formData.trusteeType === "individual") {
                return allOwnersNamesTrustComputed;
            } else {
                return companyNameAcnComputed;
            }
        }
        return null;
    };

    // Owner Payloads
    const getOwnerPayload = (index: number): OwnerPayload => {
        if (index >= formData.ownerCount) return createNullOwner();
        const o = formData.owners[index];
        return {
            full_name: toUpper(o.fullName),
            full_name_id: toUpper(o.fullName),
            full_name_trustee: trustNameUpper
                ? `${toUpper(o.fullName)} AS TRUSTEE FOR ${trustNameUpper}`
                : null,
            full_name_val: getFullNameVal(index),
            email: o.email.toLowerCase(),
            email_val: o.email.toLowerCase(),
            mobile: formatOwnerMobile(index),
            mobile_countrycode: o.mobileCountryCode.replace("+", ""),
            mobile_number: o.mobileNumber.replace(/[\s-]/g, "") || null,
            phone: o.phone || null,
            street: toUpper(o.street),
            suburb: toUpper(o.suburb),
            state: toUpper(o.state),
            postcode: toUpper(o.postcode),
            address_full: toUpper(
                [o.street, o.suburb, o.state, o.postcode]
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .join(" ")
            ),
        };
    };

    // Compute Maestro routing fields
    const needsRatesDoc = formData.councilRates || formData.landTax;
    const needsTaswaterDoc = formData.taswater;
    const docRouting: ExpenseApprovalPayload["doc_routing"] =
        needsRatesDoc && needsTaswaterDoc ? "both"
            : needsTaswaterDoc ? "taswater_only"
                : "rates_only";

    let serviceCombo = "";
    if (formData.councilRates) serviceCombo += "C";
    if (formData.landTax) serviceCombo += "L";
    if (formData.taswater) serviceCombo += "T";

    return {
        // Maestro Routing
        doc_routing: docRouting,
        service_combo: serviceCombo as ExpenseApprovalPayload["service_combo"],

        // Property
        property_street: toUpper(formData.propertyStreet.trim()) || null,
        property_suburb: toUpper(formData.propertySuburb.trim()) || null,
        property_state: toUpper(formData.propertyState.trim()) || null,
        property_postcode: toUpper(formData.propertyPostcode.trim()) || null,
        property_address_full: toUpper(
            [formData.propertyStreet, formData.propertySuburb, formData.propertyState, formData.propertyPostcode]
                .map((s) => s.trim())
                .filter(Boolean)
                .join(" ")
        ) || null,
        property_pid: formData.propertyPID.trim() || null,

        // Services (use "Not Applicable" so DocuSign renders it in the document dynamically)
        council_rates: formData.councilRates ? "Yes" : "Not Applicable",
        land_tax: formData.landTax ? "Yes" : "Not Applicable",
        taswater: formData.taswater ? "Yes" : "Not Applicable",

        // Ownership
        ownership_structure: toUpper(formData.ownershipStructure),
        ownership_type: toUpper(formData.ownershipStructure),
        ownership_subtype: formData.ownershipStructure === "Trust" ? toUpper(formData.trusteeType) : null,
        owner_count: formData.ownerCount,
        trust_name: formData.ownershipStructure === "Trust" ? trustNameUpper : null,
        company_name:
            formData.ownershipStructure === "Company" ||
                (formData.ownershipStructure === "Trust" && formData.trusteeType === "company")
                ? formData.companyName ? toUpper(formData.companyName) : null
                : null,
        company_acn:
            formData.ownershipStructure === "Company" ||
                (formData.ownershipStructure === "Trust" && formData.trusteeType === "company")
                ? formData.companyACN || null
                : null,
        company_name_acn:
            (formData.ownershipStructure === "Company" ||
                (formData.ownershipStructure === "Trust" && formData.trusteeType === "company")) &&
                formData.companyName && formData.companyACN
                ? (() => {
                    const acn = formData.companyACN.replace(/[^0-9]/g, "");
                    const formattedAcn = acn.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
                    const baseStr = `${toUpper(formData.companyName)} (ACN ${formattedAcn})`;
                    return trustNameUpper
                        ? `${baseStr} AS TRUSTEE FOR ${trustNameUpper}`
                        : baseStr;
                })()
                : null,
        all_owners_names: formData.owners
            .slice(0, formData.ownerCount)
            .map((o) => toUpper(o.fullName))
            .filter(Boolean)
            .join(", "),
        all_owners_names_trust: (() => {
            const names = formData.owners
                .slice(0, formData.ownerCount)
                .map((o) => toUpper(o.fullName))
                .filter(Boolean);

            if (names.length === 0) return null;

            if (formData.ownershipStructure === "Individual") {
                return names.join(", ");
            }

            if (formData.ownershipStructure === "Trust" && trustNameUpper) {
                let joinedNames = "";
                if (names.length === 1) {
                    joinedNames = names[0];
                } else if (names.length === 2) {
                    joinedNames = `${names[0]} AND ${names[1]}`;
                } else {
                    const namesCopy = [...names];
                    const last = namesCopy.pop();
                    joinedNames = `${namesCopy.join(", ")} AND ${last}`;
                }
                const suffixText = formData.ownerCount > 1 ? "AS TRUSTEES FOR" : "AS TRUSTEE FOR";
                return `${joinedNames} ${suffixText} ${trustNameUpper}`;
            }

            if (formData.ownershipStructure === "Company") {
                if (!formData.hasMultipleDirectors) {
                    return `DIRECTOR/SECRETARY: ${names[0] || ""}`;
                } else {
                    const director = names[0] || "";
                    const secretary = names[1] || "";
                    return `DIRECTOR: ${director}     SECRETARY: ${secretary}`;
                }
            }

            return names.join(", ");
        })(),
        all_owners_first_names: (() => {
            const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            const firstNames = formData.owners
                .slice(0, formData.ownerCount)
                .map((o) => {
                    const firstWord = o.fullName.trim().split(" ")[0];
                    return toTitleCase(firstWord);
                })
                .filter(Boolean);

            if (firstNames.length === 0) return "";
            if (firstNames.length === 1) return firstNames[0];
            if (firstNames.length === 2) return `${firstNames[0]} and ${firstNames[1]}`;
            const last = firstNames.pop();
            return `${firstNames.join(", ")}, and ${last}`;
        })(),
        all_owners_email: formData.owners
            .slice(0, formData.ownerCount)
            .map((o) => o.email.toLowerCase())
            .filter(Boolean)
            .join(";"),
        owner_1: getOwnerPayload(0),
        owner_2: getOwnerPayload(1),
        owner_3: getOwnerPayload(2),
        owner_4: getOwnerPayload(3),

        // Document uploads
        asic_register_file_name: formData.asicRegisterFileName || null,
        asic_register_file_base64: formData.asicRegisterFileBase64 || null,
        trust_schedule_file_name: formData.trustScheduleFileName || null,
        trust_schedule_file_base64: formData.trustScheduleFileBase64 || null,

        // DocuSign display fields — dot trick for section visibility
        has_rates: formData.councilRates ? "." : "",
        has_land: formData.landTax ? "." : "",

        // DocuSign display fields — TasWater checkmarks & visibility
        has_second_authorisation: (formData.taswater && formData.ownerCount >= 2) ? "." : "",
        has_change_ownership: (formData.taswater && formData.taswaterChangeOwnership) ? "✓" : "",
        trade_waste_information_only: (formData.taswater && formData.taswaterTradeWasteOnly) ? "✓" : "",
        authorisation_account_holder_1: formData.taswater && formData.taswaterAuth1Type === "account_holder" ? "✓" : "",
        authorisation_other_1: formData.taswater && formData.taswaterAuth1Type === "other" ? "✓" : "",
        authorisation_other_details_1: formData.taswater && formData.taswaterAuth1Type === "other" ? (formData.taswaterAuth1OtherText?.trim() || "") : "",
        authorisation_account_holder_2: formData.taswater && formData.ownerCount >= 2 && formData.taswaterAuth2Type === "account_holder" ? "✓" : "",
        authorisation_other_2: formData.taswater && formData.ownerCount >= 2 && formData.taswaterAuth2Type === "other" ? "✓" : "",
        authorisation_other_details_2: formData.taswater && formData.ownerCount >= 2 && formData.taswaterAuth2Type === "other" ? (formData.taswaterAuth2OtherText?.trim() || "") : "",

        // TasWater (always present, null when not applicable)
        taswater_account_no: formData.taswater ? formData.taswaterAccountNo.trim() || null : null,
        taswater_account_name: formData.taswater ? formData.taswaterAccountName.trim() || null : null,
        taswater_postal_street: formData.taswater ? toUpper(formData.taswaterPostalStreet.trim()) || null : null,
        taswater_postal_suburb: formData.taswater ? toUpper(formData.taswaterPostalSuburb.trim()) || null : null,
        taswater_postal_state: formData.taswater ? toUpper(formData.taswaterPostalState.trim()) || null : null,
        taswater_postal_postcode: formData.taswater ? formData.taswaterPostalPostcode.trim() || null : null,
        taswater_cancel_bpay: formData.taswater ? (formData.taswaterCancelBpay ? "✓" : "") : "",
        taswater_cancel_direct_debit: formData.taswater ? (formData.taswaterCancelDirectDebit ? "✓" : "") : "",
        taswater_change_ownership: formData.taswater ? (formData.taswaterChangeOwnership ? "✓" : "") : "",
        taswater_settlement_date: formData.taswater && formData.taswaterChangeOwnership
            ? formData.taswaterSettlementDate.trim() || null
            : null,
    };
}

// ============================================
// Submit (client-side via API route)
// ============================================
export async function submitExpenseApproval(
    formData: ExpenseApprovalFormData,
    existingId?: string
): Promise<{ success: boolean; error?: string; docusignUrl?: string; ownerName?: string }> {
    try {
        const payload = buildExpenseApprovalPayload(formData);

        const response = await fetch("/api/expense-approval/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formData, payload, existingId }),
        });

        if (!response.ok) {
            const text = await response.text();
            return { success: false, error: text };
        }

        const data = await response.json();
        return {
            success: true,
            docusignUrl: data.docusignUrl || undefined,
            ownerName: data.ownerName || undefined,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Submission failed",
        };
    }
}

// ============================================
// Direct webhook submission (server-side)
// ============================================
export async function sendToWebhook(
    payload: ExpenseApprovalPayload
): Promise<{ success: boolean; error?: string; docusignUrl?: string }> {
    try {
        const response = await fetch(EXPENSE_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            console.warn("Expense approval webhook failed:", text);
            return { success: false, error: text };
        }

        // Try to parse JSON response for docusign_url (same key as SAA webhook)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any = await response.json();
            console.log("📨 Expense webhook response:", JSON.stringify(result, null, 2));
            
            // Match SAA exactly: only check docusign_url key
            const rawUrl = result?.docusign_url;
            // Validate it's a real URL (not a relative path or random string)
            const docusignUrl = typeof rawUrl === "string" && rawUrl.startsWith("http") ? rawUrl : undefined;
            
            if (docusignUrl) {
                console.log("✅ DocuSign URL found:", docusignUrl);
            } else {
                console.log("⚠️ No valid docusign_url in webhook response");
            }
            return {
                success: true,
                docusignUrl,
            };
        } catch {
            // Response wasn't JSON — that's fine, webhook succeeded
            console.log("⚠️ Webhook response was not JSON");
            return { success: true };
        }
    } catch (error) {
        console.warn("Expense approval webhook error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Webhook failed",
        };
    }
}
