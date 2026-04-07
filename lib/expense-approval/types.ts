/**
 * Landlord Expense Approval Form Types
 * Mirrors offer form types pattern for expense approval
 */

// Country Codes (inlined — no dependency on offer module)
export interface CountryCode {
    code: string;
    dial: string;
    name: string;
}

export const COUNTRY_CODES: CountryCode[] = [
    { code: "AU", dial: "+61", name: "Australia" },
    { code: "NZ", dial: "+64", name: "New Zealand" },
    { code: "US", dial: "+1", name: "United States" },
    { code: "GB", dial: "+44", name: "United Kingdom" },
    { code: "SG", dial: "+65", name: "Singapore" },
    { code: "HK", dial: "+852", name: "Hong Kong" },
    { code: "CN", dial: "+86", name: "China" },
    { code: "IN", dial: "+91", name: "India" },
    { code: "PH", dial: "+63", name: "Philippines" },
    { code: "MY", dial: "+60", name: "Malaysia" },
    { code: "ID", dial: "+62", name: "Indonesia" },
    { code: "JP", dial: "+81", name: "Japan" },
    { code: "KR", dial: "+82", name: "South Korea" },
    { code: "TH", dial: "+66", name: "Thailand" },
    { code: "VN", dial: "+84", name: "Vietnam" },
    { code: "DE", dial: "+49", name: "Germany" },
    { code: "FR", dial: "+33", name: "France" },
    { code: "IT", dial: "+39", name: "Italy" },
    { code: "CA", dial: "+1", name: "Canada" },
    { code: "ZA", dial: "+27", name: "South Africa" },
];

// ============================================
// Owner Info (mirrors PurchaserInfo)
// ============================================
export interface OwnerInfo {
    fullName: string;
    email: string;
    mobileCountryCode: string;
    mobileNumber: string;
    phone: string;
    postalSameAsProperty: boolean;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
}

// ============================================
// Main Form Data
// ============================================
export interface ExpenseApprovalFormData {
    // Property Details
    propertyStreet: string;
    propertySuburb: string;
    propertyState: string;
    propertyPostcode: string;
    propertyPID: string;

    // Services Selected
    councilRates: boolean;
    landTax: boolean;
    taswater: boolean;

    // Ownership Structure
    ownershipStructure: "Individual" | "Company" | "Trust";
    trusteeType: "individual" | "company";
    trustName: string;
    companyName: string;
    companyACN: string;
    hasMultipleDirectors: boolean;
    ownerCount: 1 | 2;
    owners: OwnerInfo[];

    // Document Uploads (base64)
    asicRegisterFileName: string;
    asicRegisterFileBase64: string;
    trustScheduleFileName: string;
    trustScheduleFileBase64: string;

    // TasWater Specific
    taswaterAccountNo: string;
    taswaterAccountName: string;
    taswaterPostalSameAsProperty: boolean;
    taswaterPostalStreet: string;
    taswaterPostalSuburb: string;
    taswaterPostalState: string;
    taswaterPostalPostcode: string;
    taswaterAuthorityLevel: "" | "1" | "2" | "3";
    taswaterCancelBpay: boolean;
    taswaterCancelDirectDebit: boolean;
    taswaterTradeWasteOnly: boolean;
    taswaterChangeOwnership: boolean;
    taswaterSettlementDate: string;

    // Authorisation — "I am an" per signatory
    taswaterAuth1Type: "account_holder" | "other" | "";
    taswaterAuth1OtherText: string;
    taswaterAuth2Type: "account_holder" | "other" | "";
    taswaterAuth2OtherText: string;
}

// ============================================
// Factory Functions
// ============================================
export function createEmptyOwner(): OwnerInfo {
    return {
        fullName: "",
        email: "",
        mobileCountryCode: "+61",
        mobileNumber: "",
        phone: "",
        postalSameAsProperty: false,
        street: "",
        suburb: "",
        state: "TAS",
        postcode: "",
    };
}

export const initialExpenseApprovalFormData: ExpenseApprovalFormData = {
    // Property
    propertyStreet: "",
    propertySuburb: "",
    propertyState: "TAS",
    propertyPostcode: "",
    propertyPID: "",

    // Services
    councilRates: false,
    landTax: false,
    taswater: false,

    // Ownership
    ownershipStructure: "Individual",
    trusteeType: "individual",
    trustName: "",
    companyName: "",
    companyACN: "",
    hasMultipleDirectors: false,
    ownerCount: 1,
    owners: [createEmptyOwner()],

    // Document Uploads
    asicRegisterFileName: "",
    asicRegisterFileBase64: "",
    trustScheduleFileName: "",
    trustScheduleFileBase64: "",

    // TasWater
    taswaterAccountNo: "",
    taswaterAccountName: "",
    taswaterPostalSameAsProperty: false,
    taswaterPostalStreet: "",
    taswaterPostalSuburb: "",
    taswaterPostalState: "TAS",
    taswaterPostalPostcode: "",
    taswaterAuthorityLevel: "",
    taswaterCancelBpay: false,
    taswaterCancelDirectDebit: false,
    taswaterTradeWasteOnly: false,
    taswaterChangeOwnership: false,
    taswaterSettlementDate: "",

    // Authorisation
    taswaterAuth1Type: "",
    taswaterAuth1OtherText: "",
    taswaterAuth2Type: "",
    taswaterAuth2OtherText: "",
};

// ============================================
// Australian States
// ============================================
export const AU_STATES = [
    { value: "TAS", label: "Tasmania" },
    { value: "NSW", label: "New South Wales" },
    { value: "VIC", label: "Victoria" },
    { value: "QLD", label: "Queensland" },
    { value: "SA", label: "South Australia" },
    { value: "WA", label: "Western Australia" },
    { value: "NT", label: "Northern Territory" },
    { value: "ACT", label: "Australian Capital Territory" },
];

// ============================================
// TasWater Authority Levels
// ============================================
export const TASWATER_AUTHORITY_LEVELS = [
    {
        value: "1",
        label: "Level 1",
        description: "Receive and hold notices on my behalf",
    },
    {
        value: "2",
        label: "Level 2",
        description: "Receive, hold, and pay notices on my behalf",
    },
    {
        value: "3",
        label: "Level 3",
        description: "Full authority to act on my behalf",
    },
];
