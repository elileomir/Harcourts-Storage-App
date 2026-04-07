/**
 * Expense Approval Security
 * Honeypot validation, input sanitization (mirrors offer/security.ts)
 */

import type { ExpenseApprovalFormData } from "./types";

// ============================================
// Honeypot Validation
// ============================================
export function validateHoneypot(honeypotValue: string | undefined): boolean {
    // If honeypot field has a value, it's likely a bot
    return !honeypotValue || honeypotValue.trim() === "";
}

// ============================================
// Input Sanitization
// ============================================
function sanitizeString(value: string): string {
    if (typeof value !== "string") return "";
    return value
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "")
        .trim();
}

export function sanitizeFormData(formData: ExpenseApprovalFormData): ExpenseApprovalFormData {
    return {
        ...formData,
        propertyStreet: sanitizeString(formData.propertyStreet),
        propertySuburb: sanitizeString(formData.propertySuburb),
        propertyState: sanitizeString(formData.propertyState),
        propertyPostcode: sanitizeString(formData.propertyPostcode),
        propertyPID: sanitizeString(formData.propertyPID),

        trustName: sanitizeString(formData.trustName),
        companyName: sanitizeString(formData.companyName),
        companyACN: sanitizeString(formData.companyACN),

        owners: formData.owners.map((o) => ({
            ...o,
            fullName: sanitizeString(o.fullName),
            email: sanitizeString(o.email),
            mobileNumber: sanitizeString(o.mobileNumber),
            phone: sanitizeString(o.phone),
            street: sanitizeString(o.street),
            suburb: sanitizeString(o.suburb),
            state: sanitizeString(o.state),
            postcode: sanitizeString(o.postcode),
        })),

        taswaterAccountNo: sanitizeString(formData.taswaterAccountNo),
        taswaterAccountName: sanitizeString(formData.taswaterAccountName),
        taswaterPostalStreet: sanitizeString(formData.taswaterPostalStreet),
        taswaterPostalSuburb: sanitizeString(formData.taswaterPostalSuburb),
        taswaterPostalState: sanitizeString(formData.taswaterPostalState),
        taswaterPostalPostcode: sanitizeString(formData.taswaterPostalPostcode),
        taswaterSettlementDate: sanitizeString(formData.taswaterSettlementDate),
    };
}

// ============================================
// Submission Validation
// ============================================
export function validateSubmission(formData: ExpenseApprovalFormData): { valid: boolean; error?: string } {
    // Must have at least one service
    if (!formData.councilRates && !formData.landTax && !formData.taswater) {
        return { valid: false, error: "At least one service must be selected" };
    }

    // Must have property address
    if (!formData.propertyStreet.trim() || !formData.propertySuburb.trim()) {
        return { valid: false, error: "Property address is required" };
    }

    // Must have at least one owner with a name
    if (!formData.owners[0]?.fullName.trim()) {
        return { valid: false, error: "At least one owner name is required" };
    }

    return { valid: true };
}
