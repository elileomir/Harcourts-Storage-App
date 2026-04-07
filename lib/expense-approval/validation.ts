/**
 * Expense Approval Form Validation
 * Step-based validation for property/services, ownership, and TasWater details
 */

import type { ExpenseApprovalFormData } from "./types";

export type ValidationErrors = Record<string, string>;

// ============================================
// Helpers
// ============================================
const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidMobile = (number: string): boolean =>
    /^\d{9,15}$/.test(number.replace(/\s/g, ""));

const isValidACN = (acn: string): boolean =>
    /^\d{9}$/.test(acn.replace(/\s/g, ""));

// ============================================
// Step 0: Property & Services
// ============================================
export function validatePropertyServiceStep(formData: ExpenseApprovalFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!formData.propertyStreet.trim()) {
        errors.propertyStreet = "Street address is required";
    }
    if (!formData.propertySuburb.trim()) {
        errors.propertySuburb = "Suburb is required";
    }
    if (!formData.propertyState.trim()) {
        errors.propertyState = "State is required";
    }
    if (!formData.propertyPostcode.trim()) {
        errors.propertyPostcode = "Postcode is required";
    }

    // At least one service must be selected
    if (!formData.councilRates && !formData.landTax && !formData.taswater) {
        errors.services = "Please select at least one service";
    }

    return errors;
}

// ============================================
// Step 1: Ownership Structure
// ============================================
export function validateOwnershipStep(formData: ExpenseApprovalFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    // Trust-specific
    if (formData.ownershipStructure === "Trust") {
        if (!formData.trustName.trim()) {
            errors.trustName = "Trust name is required";
        }
    }

    // Company-specific (also applies to Trust with company trustee)
    if (
        formData.ownershipStructure === "Company" ||
        (formData.ownershipStructure === "Trust" && formData.trusteeType === "company")
    ) {
        if (!formData.companyName.trim()) {
            errors.companyName = "Company name is required";
        }
        if (!formData.companyACN.trim()) {
            errors.companyACN = "ACN is required";
        } else if (!isValidACN(formData.companyACN)) {
            errors.companyACN = "ACN must be 9 digits";
        }
    }

    // Validate each owner
    for (let i = 0; i < formData.ownerCount; i++) {
        const o = formData.owners[i];
        if (!o) continue;

        const prefix = `owner_${i}`;

        if (!o.fullName.trim()) {
            errors[`${prefix}_fullName`] = "Full name is required";
        }
        if (!o.email.trim()) {
            errors[`${prefix}_email`] = "Email is required";
        } else if (!isValidEmail(o.email)) {
            errors[`${prefix}_email`] = "Invalid email address";
        }
        if (!o.mobileNumber.trim()) {
            errors[`${prefix}_mobileNumber`] = "Mobile number is required";
        } else if (o.mobileCountryCode === "+61" && o.mobileNumber.replace(/\s/g, "").length !== 9) {
            errors[`${prefix}_mobileNumber`] = "Australian mobile must be exactly 9 digits (e.g. 412 345 678)";
        } else if (!isValidMobile(o.mobileNumber)) {
            errors[`${prefix}_mobileNumber`] = "Mobile number must be at least 9 digits";
        }
        if (!o.street.trim()) {
            errors[`${prefix}_street`] = "Street address is required";
        }
        if (!o.suburb.trim()) {
            errors[`${prefix}_suburb`] = "Suburb is required";
        }
        if (!o.state.trim()) {
            errors[`${prefix}_state`] = "State is required";
        }
        if (!o.postcode.trim()) {
            errors[`${prefix}_postcode`] = "Postcode is required";
        }
    }

    // Document upload validation
    if (
        formData.ownershipStructure === "Company" ||
        (formData.ownershipStructure === "Trust" && formData.trusteeType === "company")
    ) {
        if (!formData.asicRegisterFileBase64) {
            errors.asicRegisterFile = "ASIC register showing Directors is required";
        }
    }

    if (formData.ownershipStructure === "Trust") {
        if (!formData.trustScheduleFileBase64) {
            errors.trustScheduleFile = "Trust Schedule showing Trustee is required";
        }
    }

    return errors;
}

// ============================================
// Step 2: TasWater Details (conditional)
// ============================================
export function validateTasWaterStep(formData: ExpenseApprovalFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    // Only validate if TasWater is selected
    if (!formData.taswater) return errors;

    if (!formData.taswaterAccountNo.trim()) {
        errors.taswaterAccountNo = "Account number is required";
    }
    if (!formData.taswaterAccountName.trim()) {
        errors.taswaterAccountName = "Account name is required";
    }

    if (formData.taswaterChangeOwnership && !formData.taswaterSettlementDate.trim()) {
        errors.taswaterSettlementDate = "Settlement date is required when change of ownership is selected";
    }

    // Authorisation type is required for each signatory
    if (!formData.taswaterAuth1Type) {
        errors.taswaterAuth1Type = "Please select Account Holder or Other";
    }
    if (formData.ownerCount >= 2 && !formData.taswaterAuth2Type) {
        errors.taswaterAuth2Type = "Please select Account Holder or Other";
    }

    return errors;
}

// ============================================
// Validate by step index
// ============================================
export function validateStep(
    step: number,
    formData: ExpenseApprovalFormData
): ValidationErrors {
    switch (step) {
        case 0:
            return validatePropertyServiceStep(formData);
        case 1:
            return validateOwnershipStep(formData);
        case 2:
            return validateTasWaterStep(formData);
        case 3:
            return {}; // Review step — no validation
        default:
            return {};
    }
}

export function isStepValid(step: number, formData: ExpenseApprovalFormData): boolean {
    return Object.keys(validateStep(step, formData)).length === 0;
}

/**
 * Get the effective steps based on whether TasWater is selected.
 * If TasWater is not selected, step 2 (TasWater Details) is skipped.
 */
export function getEffectiveSteps(formData: ExpenseApprovalFormData) {
    const allSteps = [
        { id: 0, title: "Property & Services", shortTitle: "Property" },
        { id: 1, title: "Ownership Structure", shortTitle: "Ownership" },
        { id: 2, title: "TasWater Details", shortTitle: "TasWater" },
        { id: 3, title: "Review & Submit", shortTitle: "Review" },
    ];

    if (!formData.taswater) {
        return allSteps.filter((s) => s.id !== 2);
    }

    return allSteps;
}
