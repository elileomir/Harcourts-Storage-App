"use client";

import { COUNTRY_CODES, createEmptyOwner } from "@/lib/expense-approval/types";
import type { ExpenseApprovalFormData, OwnerInfo } from "@/lib/expense-approval/types";
import { AlertCircle, Info, UserPlus, UserMinus, Phone, Building2, Briefcase, Upload, X, FileText, Copy } from "lucide-react";
import { CustomDropdown } from "@/components/offer/CustomDropdown";
import { useCallback } from "react";
import { SuburbAutocomplete } from "@/components/saa/SuburbAutocomplete";
import { isValidSuburb } from "@/lib/saa/suburbs";

interface OwnershipSectionProps {
    formData: ExpenseApprovalFormData;
    updateFormData: (updates: Partial<ExpenseApprovalFormData>) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

export function OwnershipSection({
    formData,
    updateFormData,
    errors,
    setErrors,
}: OwnershipSectionProps) {
    const updateOwner = (
        index: number,
        field: keyof OwnerInfo,
        value: string
    ) => {
        const updated = [...formData.owners];
        updated[index] = { ...updated[index], [field]: value };
        updateFormData({ owners: updated });
        const key = `owner_${index}_${field}`;
        if (errors[key]) {
            const newErrors = { ...errors };
            delete newErrors[key];
            setErrors(newErrors);
        }
    };

    const handleOwnerCountChange = (delta: number) => {
        const newCount = Math.min(2, Math.max(1, formData.ownerCount + delta)) as 1 | 2;
        const updatedOwners = [...formData.owners];
        while (updatedOwners.length < newCount) {
            updatedOwners.push(createEmptyOwner());
        }
        updateFormData({
            ownerCount: newCount,
            owners: updatedOwners,
        });
    };

    const handleSameAddressChange = (index: number, checked: boolean) => {
        const updated = [...formData.owners];
        const owner = { ...updated[index] };
        owner.postalSameAsProperty = checked;

        if (checked) {
            owner.street = formData.propertyStreet;
            owner.suburb = formData.propertySuburb;
            owner.postcode = formData.propertyPostcode;
            owner.state = formData.propertyState;
        } else {
            owner.street = "";
            owner.suburb = "";
            owner.postcode = "";
            owner.state = "TAS";
        }

        updated[index] = owner;
        updateFormData({ owners: updated });
    };

    const handleOwnershipStructureChange = (structure: ExpenseApprovalFormData["ownershipStructure"]) => {
        updateFormData({ ownershipStructure: structure });
    };

    const handleTrusteeTypeChange = (trusteeType: ExpenseApprovalFormData["trusteeType"]) => {
        updateFormData({
            trusteeType,
            ownerCount: trusteeType === "company"
                ? (formData.hasMultipleDirectors ? 2 : 1)
                : formData.ownerCount,
        });
    };

    const handleFileUpload = useCallback((
        field: "asicRegisterFileBase64" | "trustScheduleFileBase64",
        nameField: "asicRegisterFileName" | "trustScheduleFileName"
    ) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be under 10MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                updateFormData({
                    [field]: base64,
                    [nameField]: file.name,
                });
                // Clear error
                const errorKey = field === "asicRegisterFileBase64" ? "asicRegisterFile" : "trustScheduleFile";
                if (errors[errorKey]) {
                    const newErrors = { ...errors };
                    delete newErrors[errorKey];
                    setErrors(newErrors);
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }, [errors, setErrors, updateFormData]);

    const structures: Array<{ value: ExpenseApprovalFormData["ownershipStructure"]; label: string }> = [
        { value: "Individual", label: "Individual" },
        { value: "Company", label: "Company" },
        { value: "Trust", label: "Trust" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                    Please enter the owner details exactly as they appear on the property title. Up to 4 owners can be added.
                </p>
            </div>

            {/* Ownership Structure Selector */}
            <div className="p-4 sm:p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4">
                <label className="field-label mb-3 block text-base">
                    What is the ownership structure of this property?
                </label>
                <div className="flex flex-wrap gap-3">
                    {structures.map((s) => (
                        <label
                            key={s.value}
                            className={`
                                flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all
                                ${formData.ownershipStructure === s.value
                                    ? "border-harcourts-blue bg-harcourts-blue/5 text-harcourts-blue font-semibold"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name="ownershipStructure"
                                value={s.value}
                                checked={formData.ownershipStructure === s.value}
                                onChange={() => handleOwnershipStructureChange(s.value)}
                                className="sr-only"
                            />
                            {s.value === "Individual" && <UserPlus className="w-4 h-4" />}
                            {s.value === "Company" && <Building2 className="w-4 h-4" />}
                            {s.value === "Trust" && <Briefcase className="w-4 h-4" />}
                            {s.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Trust Fields */}
            {formData.ownershipStructure === "Trust" && (
                <div className="p-4 sm:p-5 bg-purple-50/30 rounded-xl border border-purple-100 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        <h3 className="font-semibold text-purple-900">Trust Details</h3>
                    </div>

                    <div>
                        <label className="field-label">Trust Name *</label>
                        <input
                            type="text"
                            value={formData.trustName}
                            onChange={(e) => {
                                updateFormData({ trustName: e.target.value });
                                if (errors.trustName) {
                                    const ne = { ...errors }; delete ne.trustName; setErrors(ne);
                                }
                            }}
                            placeholder="e.g. Smith Family Trust"
                            className={`form-input ${errors.trustName ? "border-red-500" : ""}`}
                        />
                        {errors.trustName && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{errors.trustName}
                            </p>
                        )}
                    </div>

                    {/* Trustee Type */}
                    <div>
                        <label className="field-label mb-2 block">Trustee Type</label>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { value: "individual" as const, label: "Individual Trustee" },
                                { value: "company" as const, label: "Company Trustee" },
                            ].map((tt) => (
                                <label
                                    key={tt.value}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm
                                        ${formData.trusteeType === tt.value
                                            ? "border-purple-500 bg-purple-50 text-purple-700 font-medium"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="trusteeType"
                                        value={tt.value}
                                        checked={formData.trusteeType === tt.value}
                                        onChange={() => handleTrusteeTypeChange(tt.value)}
                                        className="sr-only"
                                    />
                                    {tt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Trust Schedule Upload */}
                    <div>
                        <label className="field-label">Trust Schedule / Trust Deed *</label>
                        {formData.trustScheduleFileBase64 ? (
                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200">
                                <FileText className="w-4 h-4 text-purple-500" />
                                <span className="text-sm text-gray-700 flex-1 truncate">{formData.trustScheduleFileName}</span>
                                <button
                                    type="button"
                                    onClick={() => updateFormData({ trustScheduleFileBase64: "", trustScheduleFileName: "" })}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleFileUpload("trustScheduleFileBase64", "trustScheduleFileName")}
                                className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all text-sm ${errors.trustScheduleFile
                                    ? "border-red-400 bg-red-50 text-red-600"
                                    : "border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-500"
                                    }`}
                            >
                                <Upload className="w-4 h-4" />
                                Upload Trust Schedule
                            </button>
                        )}
                        {errors.trustScheduleFile && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{errors.trustScheduleFile}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Company Fields */}
            {(formData.ownershipStructure === "Company" ||
                (formData.ownershipStructure === "Trust" && formData.trusteeType === "company")) && (
                    <div className="p-4 sm:p-5 bg-blue-50/30 rounded-xl border border-blue-100 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold text-blue-900">
                                {formData.ownershipStructure === "Trust" ? "Trustee Company Details" : "Company Details"}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="field-label">Company Name *</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => {
                                        updateFormData({ companyName: e.target.value });
                                        if (errors.companyName) {
                                            const ne = { ...errors }; delete ne.companyName; setErrors(ne);
                                        }
                                    }}
                                    placeholder="e.g. Smith Holdings Pty Ltd"
                                    className={`form-input ${errors.companyName ? "border-red-500" : ""}`}
                                />
                                {errors.companyName && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />{errors.companyName}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="field-label">ACN *</label>
                                <input
                                    type="text"
                                    value={formData.companyACN}
                                    onChange={(e) => {
                                        updateFormData({ companyACN: e.target.value });
                                        if (errors.companyACN) {
                                            const ne = { ...errors }; delete ne.companyACN; setErrors(ne);
                                        }
                                    }}
                                    placeholder="e.g. 123 456 789"
                                    maxLength={11}
                                    className={`form-input ${errors.companyACN ? "border-red-500" : ""}`}
                                />
                                {errors.companyACN && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />{errors.companyACN}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Multiple Directors */}
                        <div>
                            <label className="field-label mb-2 block">
                                Does the company have more than one director?
                            </label>
                            <div className="flex gap-4">
                                {[
                                    { label: "Yes", value: true },
                                    { label: "No", value: false },
                                ].map((option) => (
                                    <label
                                        key={option.label}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm
                                            ${formData.hasMultipleDirectors === option.value
                                                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="hasMultipleDirectors"
                                            checked={formData.hasMultipleDirectors === option.value}
                                            onChange={() =>
                                                updateFormData({
                                                    hasMultipleDirectors: option.value,
                                                    ownerCount: option.value ? 2 : 1,
                                                })
                                            }
                                            className="sr-only"
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* ASIC Register Upload */}
                        <div>
                            <label className="field-label">ASIC Register (showing Directors) *</label>
                            {formData.asicRegisterFileBase64 ? (
                                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-gray-700 flex-1 truncate">{formData.asicRegisterFileName}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ asicRegisterFileBase64: "", asicRegisterFileName: "" })}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleFileUpload("asicRegisterFileBase64", "asicRegisterFileName")}
                                    className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all text-sm ${errors.asicRegisterFile
                                        ? "border-red-400 bg-red-50 text-red-600"
                                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500"
                                        }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload ASIC Register
                                </button>
                            )}
                            {errors.asicRegisterFile && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.asicRegisterFile}
                                </p>
                            )}
                        </div>
                    </div>
                )}

            {/* Owner Cards */}
            <div className="space-y-4">
                {/* Owner Count Controls */}
                {formData.ownershipStructure === "Individual" && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                            Number of Owners: {formData.ownerCount}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleOwnerCountChange(-1)}
                                disabled={formData.ownerCount <= 1}
                                className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <UserMinus className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleOwnerCountChange(1)}
                                disabled={formData.ownerCount >= 2}
                                className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {Array.from({ length: formData.ownerCount }).map((_, i) => {
                    const o = formData.owners[i];
                    if (!o) return null;
                    const prefix = `owner_${i}`;

                    // Determine label (for Company: Director/Secretary)
                    let ownerLabel = `Owner ${i + 1}`;
                    if (formData.ownershipStructure === "Company" || (formData.ownershipStructure === "Trust" && formData.trusteeType === "company")) {
                        if (!formData.hasMultipleDirectors) {
                            ownerLabel = "Director / Secretary";
                        } else {
                            ownerLabel = i === 0 ? "Director" : "Secretary";
                        }
                    } else if (formData.ownershipStructure === "Trust" && formData.trusteeType === "individual") {
                        ownerLabel = `Trustee ${formData.ownerCount > 1 ? i + 1 : ""}`.trim();
                    }

                    return (
                        <div key={i} className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white space-y-3">
                            <h4 className="font-semibold text-harcourts-navy flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-harcourts-blue/10 text-harcourts-blue text-xs flex items-center justify-center font-bold">
                                    {i + 1}
                                </span>
                                {ownerLabel}
                            </h4>

                            {/* Full Name */}
                            <div>
                                <label className="field-label">
                                    Full Name{" "}
                                    <span className="text-gray-400 font-normal text-xs">
                                        (Full Name on ID)
                                    </span>{" "}
                                    *
                                </label>
                                <input
                                    type="text"
                                    value={o.fullName}
                                    onChange={(e) => updateOwner(i, "fullName", e.target.value)}
                                    placeholder="As shown on property title"
                                    className={`form-input ${errors[`${prefix}_fullName`] ? "border-red-500" : ""}`}
                                />
                                {errors[`${prefix}_fullName`] && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />{errors[`${prefix}_fullName`]}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="field-label">Email *</label>
                                <input
                                    type="email"
                                    value={o.email}
                                    onChange={(e) => updateOwner(i, "email", e.target.value)}
                                    placeholder="email@example.com"
                                    className={`form-input ${errors[`${prefix}_email`] ? "border-red-500" : ""}`}
                                />
                                {errors[`${prefix}_email`] && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />{errors[`${prefix}_email`]}
                                    </p>
                                )}
                            </div>

                            {/* Mobile */}
                            <div>
                                <label className="field-label">Mobile *</label>
                                <div className="flex gap-2">
                                    <CustomDropdown
                                        value={o.mobileCountryCode}
                                        options={COUNTRY_CODES.map((c) => ({
                                            value: c.dial,
                                            label: `${c.dial} ${c.code}`,
                                        }))}
                                        onChange={(v) => updateOwner(i, "mobileCountryCode", v)}
                                        icon={<Phone className="w-3.5 h-3.5" />}
                                        width="w-28"
                                    />
                                    <input
                                        type="tel"
                                        value={o.mobileNumber}
                                        onChange={(e) => updateOwner(i, "mobileNumber", e.target.value)}
                                        placeholder="412 345 678"
                                        className={`form-input flex-1 ${errors[`${prefix}_mobileNumber`] ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {errors[`${prefix}_mobileNumber`] && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />{errors[`${prefix}_mobileNumber`]}
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="field-label">Postal Address *</label>
                                    <button
                                        type="button"
                                        onClick={() => handleSameAddressChange(i, !o.postalSameAsProperty)}
                                        className="text-xs text-harcourts-blue hover:text-harcourts-navy font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <Copy className="w-3 h-3" />
                                        {o.postalSameAsProperty
                                            ? "Unlink Property Address"
                                            : "Same as Property Address"}
                                    </button>
                                </div>

                                {o.postalSameAsProperty ? (
                                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <p className="text-sm text-gray-700">
                                            {formData.propertyStreet}, {formData.propertySuburb} {formData.propertyState} {formData.propertyPostcode}
                                        </p>
                                        <p className="text-xs text-blue-500 mt-1">Linked to property address above</p>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            value={o.street}
                                            onChange={(e) => updateOwner(i, "street", e.target.value)}
                                            placeholder="Street address"
                                            className={`form-input mb-2 ${errors[`${prefix}_street`] ? "border-red-500" : ""}`}
                                        />
                                        {errors[`${prefix}_street`] && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1 mb-2">
                                                <AlertCircle className="w-3 h-3" />{errors[`${prefix}_street`]}
                                            </p>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                            <div className="md:col-span-8">
                                                <SuburbAutocomplete
                                                    value={o.suburb}
                                                    onChange={(value) => updateOwner(i, "suburb", value)}
                                                    onSelect={(suburb) => {
                                                        const updated = [...formData.owners];
                                                        updated[i] = {
                                                            ...updated[i],
                                                            suburb: suburb.suburb,
                                                            postcode: suburb.postcode,
                                                            state: suburb.state,
                                                        };
                                                        updateFormData({ owners: updated });
                                                        const newErrors = { ...errors };
                                                        delete newErrors[`${prefix}_suburb`];
                                                        delete newErrors[`${prefix}_postcode`];
                                                        setErrors(newErrors);
                                                    }}
                                                    error={!!errors[`${prefix}_suburb`]}
                                                />
                                                {errors[`${prefix}_suburb`] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />{errors[`${prefix}_suburb`]}
                                                    </p>
                                                )}
                                                {o.suburb && !isValidSuburb(o.suburb) && (
                                                    <p className="text-xs text-amber-600 mt-1">
                                                        Warning: Suburb not found in Tasmania database
                                                    </p>
                                                )}
                                            </div>
                                            <div className="md:col-span-4">
                                                <input
                                                    type="text"
                                                    value={o.postcode}
                                                    onChange={(e) => updateOwner(i, "postcode", e.target.value.replace(/[^0-9]/g, ""))}
                                                    placeholder="Postcode"
                                                    maxLength={4}
                                                    className={`form-input ${errors[`${prefix}_postcode`] ? "border-red-500" : ""}`}
                                                />
                                                {errors[`${prefix}_postcode`] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />{errors[`${prefix}_postcode`]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
