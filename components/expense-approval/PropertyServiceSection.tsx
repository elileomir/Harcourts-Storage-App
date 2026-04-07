"use client";

import type { ExpenseApprovalFormData } from "@/lib/expense-approval/types";
import {
    AlertCircle,
    Info,
    MapPin,
    Building2,
    Droplets,
    FileText,
    CheckSquare,
} from "lucide-react";
import { SuburbAutocomplete } from "@/components/saa/SuburbAutocomplete";
import { isValidSuburb } from "@/lib/saa/suburbs";

interface PropertyServiceSectionProps {
    formData: ExpenseApprovalFormData;
    updateFormData: (updates: Partial<ExpenseApprovalFormData>) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

const SERVICES = [
    {
        key: "councilRates" as const,
        label: "Council Rates",
        description: "Collection and payment of council rates on your behalf",
        icon: Building2,
        color: "blue",
    },
    {
        key: "landTax" as const,
        label: "Land Tax",
        description: "Collection and payment of land tax on your behalf",
        icon: FileText,
        color: "indigo",
    },
    {
        key: "taswater" as const,
        label: "TasWater",
        description: "Collection and payment of TasWater bills on your behalf",
        icon: Droplets,
        color: "teal",
    },
];

export function PropertyServiceSection({
    formData,
    updateFormData,
    errors,
    setErrors,
}: PropertyServiceSectionProps) {
    const clearError = (key: string) => {
        if (errors[key]) {
            const newErrors = { ...errors };
            delete newErrors[key];
            setErrors(newErrors);
        }
    };

    const toggleService = (key: "councilRates" | "landTax" | "taswater") => {
        updateFormData({ [key]: !formData[key] });
        clearError("services");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                    As a complimentary service, we are able to collect and process payments of
                    council rates, water and land tax bills on your behalf. Please enter the
                    property details and select which services you&apos;d like us to manage.
                </p>
            </div>

            {/* Property Address */}
            <div className="p-4 sm:p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-harcourts-blue" />
                    <h3 className="font-semibold text-harcourts-navy">Property Address</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Street Address - 8 cols */}
                    <div className="md:col-span-8">
                        <label className="field-label">Street Address *</label>
                        <input
                            type="text"
                            value={formData.propertyStreet}
                            onChange={(e) => {
                                updateFormData({ propertyStreet: e.target.value });
                                clearError("propertyStreet");
                            }}
                            placeholder="e.g. 123 Main Street"
                            className={`form-input ${errors.propertyStreet ? "border-red-500" : ""}`}
                        />
                        {errors.propertyStreet && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.propertyStreet}
                            </p>
                        )}
                    </div>

                    {/* Postcode - 4 cols */}
                    <div className="md:col-span-4">
                        <label className="field-label">Postcode *</label>
                        <input
                            type="text"
                            value={formData.propertyPostcode}
                            onChange={(e) => {
                                updateFormData({ propertyPostcode: e.target.value.replace(/[^0-9]/g, "") });
                                clearError("propertyPostcode");
                            }}
                            placeholder="7315"
                            maxLength={4}
                            className={`form-input ${errors.propertyPostcode ? "border-red-500" : ""}`}
                        />
                        {errors.propertyPostcode && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.propertyPostcode}
                            </p>
                        )}
                    </div>

                    {/* Suburb with Autocomplete - full width */}
                    <div className="md:col-span-12">
                        <label htmlFor="property-suburb" className="field-label">Suburb *</label>
                        <SuburbAutocomplete
                            value={formData.propertySuburb}
                            onChange={(value) => {
                                updateFormData({ propertySuburb: value });
                                clearError("propertySuburb");
                            }}
                            onSelect={(suburb) => {
                                updateFormData({
                                    propertySuburb: suburb.suburb,
                                    propertyPostcode: suburb.postcode,
                                    propertyState: suburb.state,
                                });
                                const newErrors = { ...errors };
                                delete newErrors.propertySuburb;
                                delete newErrors.propertyPostcode;
                                delete newErrors.propertyState;
                                setErrors(newErrors);
                            }}
                            error={!!errors.propertySuburb}
                        />
                        {errors.propertySuburb && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.propertySuburb}
                            </p>
                        )}
                        {formData.propertySuburb &&
                            !isValidSuburb(formData.propertySuburb) && (
                                <p className="text-xs text-amber-600 mt-1">
                                    Warning: Suburb not found in Tasmania database
                                </p>
                            )}
                    </div>

                    {/* PID - full width */}
                    <div className="md:col-span-12">
                        <label className="field-label">
                            Property Identification (PID)
                            <span className="text-gray-400 font-normal ml-1">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.propertyPID}
                            onChange={(e) => updateFormData({ propertyPID: e.target.value })}
                            placeholder="e.g. 1234567"
                            className="form-input"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Required for TasWater. You can find this on your council rates notice.
                        </p>
                    </div>
                </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-harcourts-blue" />
                    <h3 className="font-semibold text-harcourts-navy">
                        Services to Collect & Pay *
                    </h3>
                </div>
                <p className="text-sm text-gray-500">
                    Select which services you would like us to collect and pay on your behalf.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SERVICES.map((svc) => {
                        const Icon = svc.icon;
                        const isSelected = formData[svc.key];

                        return (
                            <button
                                key={svc.key}
                                type="button"
                                onClick={() => toggleService(svc.key)}
                                className={`
                                    p-4 rounded-xl border-2 text-left transition-all duration-200
                                    ${isSelected
                                        ? `border-harcourts-blue bg-harcourts-blue/5 shadow-sm`
                                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                    }
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected
                                            ? "bg-harcourts-blue text-white"
                                            : "bg-gray-100 text-gray-400"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm ${isSelected ? "text-harcourts-blue" : "text-gray-700"}`}>
                                            {svc.label}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{svc.description}</p>
                                    </div>
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isSelected
                                            ? "border-harcourts-blue bg-harcourts-blue"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {errors.services && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.services}
                    </p>
                )}

                {formData.taswater && (
                    <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                        <Droplets className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-teal-700">
                            You&apos;ve selected TasWater. Additional account details will be collected in a later step.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
