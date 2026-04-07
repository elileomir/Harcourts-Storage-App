"use client";

import { useRef } from "react";
import type { ExpenseApprovalFormData } from "@/lib/expense-approval/types";
import { AlertCircle, Info, Droplets, Calendar } from "lucide-react";

interface TasWaterSectionProps {
    formData: ExpenseApprovalFormData;
    updateFormData: (updates: Partial<ExpenseApprovalFormData>) => void;
    errors: Record<string, string>;
    setErrors: (errors: Record<string, string>) => void;
}

export function TasWaterSection({
    formData,
    updateFormData,
    errors,
    setErrors,
}: TasWaterSectionProps) {
    const datePickerRef = useRef<HTMLInputElement>(null);

    const clearError = (key: string) => {
        if (errors[key]) {
            const newErrors = { ...errors };
            delete newErrors[key];
            setErrors(newErrors);
        }
    };

    const openDatePicker = () => {
        try {
            datePickerRef.current?.showPicker();
        } catch {
            datePickerRef.current?.click();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
                <Droplets className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-teal-700">
                    Please provide your TasWater account details below. This information will be used
                    to set up the authority for us to manage your water account on your behalf.
                </p>
            </div>

            {/* Account Details */}
            <div className="p-4 sm:p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-teal-600" />
                    <h3 className="font-semibold text-harcourts-navy">Account Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="field-label">Account Number *</label>
                        <input
                            type="text"
                            value={formData.taswaterAccountNo}
                            onChange={(e) => {
                                updateFormData({ taswaterAccountNo: e.target.value });
                                clearError("taswaterAccountNo");
                            }}
                            placeholder="e.g. 12345678"
                            className={`form-input ${errors.taswaterAccountNo ? "border-red-500" : ""}`}
                        />
                        {errors.taswaterAccountNo && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{errors.taswaterAccountNo}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="field-label">Account Name *</label>
                        <input
                            type="text"
                            value={formData.taswaterAccountName}
                            onChange={(e) => {
                                updateFormData({ taswaterAccountName: e.target.value });
                                clearError("taswaterAccountName");
                            }}
                            placeholder="As it appears on your TasWater account"
                            className={`form-input ${errors.taswaterAccountName ? "border-red-500" : ""}`}
                        />
                        {errors.taswaterAccountName && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{errors.taswaterAccountName}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Authorisation — "I am an:" per signatory */}
            <div className="p-4 sm:p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-teal-600" />
                    <h3 className="font-semibold text-harcourts-navy">Authorisation</h3>
                </div>

                {/* Signatory 1 */}
                <div className="space-y-2">
                    <label className="field-label mb-1 block">
                        {formData.owners[0]?.fullName
                            ? `${formData.owners[0].fullName} — I am an:`
                            : "Signatory 1 — I am an:"}
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: "Account Holder", value: "account_holder" as const },
                            { label: "Other", value: "other" as const },
                        ].map((opt) => (
                            <label
                                key={`auth1-${opt.value}`}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm
                                    ${formData.taswaterAuth1Type === opt.value
                                        ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="auth1Type"
                                    checked={formData.taswaterAuth1Type === opt.value}
                                    onChange={() => {
                                        updateFormData({ taswaterAuth1Type: opt.value });
                                        clearError("taswaterAuth1Type");
                                    }}
                                    className="sr-only"
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                    {errors.taswaterAuth1Type && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />{errors.taswaterAuth1Type}
                        </p>
                    )}
                    {formData.taswaterAuth1Type === "other" && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={formData.taswaterAuth1OtherText || ""}
                                onChange={(e) => updateFormData({ taswaterAuth1OtherText: e.target.value })}
                                placeholder="e.g. Company Director / President / CEO"
                                className="form-input text-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Signatory 2 — only if 2+ owners */}
                {formData.ownerCount >= 2 && (
                    <div className="space-y-2 pt-3 border-t border-gray-100">
                        <label className="field-label mb-1 block">
                            {formData.owners[1]?.fullName
                                ? `${formData.owners[1].fullName} — I am an:`
                                : "Signatory 2 — I am an:"}
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: "Account Holder", value: "account_holder" as const },
                                { label: "Other", value: "other" as const },
                            ].map((opt) => (
                                <label
                                    key={`auth2-${opt.value}`}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm
                                        ${formData.taswaterAuth2Type === opt.value
                                            ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="auth2Type"
                                        checked={formData.taswaterAuth2Type === opt.value}
                                        onChange={() => {
                                            updateFormData({ taswaterAuth2Type: opt.value });
                                            clearError("taswaterAuth2Type");
                                        }}
                                        className="sr-only"
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                        {errors.taswaterAuth2Type && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />{errors.taswaterAuth2Type}
                            </p>
                        )}
                        {formData.taswaterAuth2Type === "other" && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={formData.taswaterAuth2OtherText || ""}
                                    onChange={(e) => updateFormData({ taswaterAuth2OtherText: e.target.value })}
                                    placeholder="e.g. Company Director / President / CEO"
                                    className="form-input text-sm"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Trade Waste */}
            <div className="p-4 sm:p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-teal-600" />
                    <h3 className="font-semibold text-harcourts-navy">Trade Waste</h3>
                </div>
                <label className="field-label mb-1 block">
                    Is this authorisation for access to Trade Waste information only?
                </label>
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: "Yes", value: true },
                        { label: "No", value: false },
                    ].map((opt) => (
                        <label
                            key={`trade-waste-${opt.label}`}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm
                                ${formData.taswaterTradeWasteOnly === opt.value
                                    ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name="tradeWasteOnly"
                                checked={formData.taswaterTradeWasteOnly === opt.value}
                                onChange={() => updateFormData({ taswaterTradeWasteOnly: opt.value })}
                                className="sr-only"
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
                {formData.taswaterTradeWasteOnly && (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        Trade Waste Authorised Representatives will not be granted access to water and sewerage account information.
                    </p>
                )}
            </div>

            {/* Purchase & Settlement */}
            <div className="p-4 sm:p-5 bg-gray-50/50 rounded-xl border border-gray-100 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-teal-600" />
                    <h3 className="font-semibold text-harcourts-navy">Recent Purchase</h3>
                </div>

                {/* Recently Purchased */}
                <div className="space-y-3">
                    <label className="field-label mb-2 block">
                        Have you recently purchased this property?
                    </label>
                    <div className="flex gap-4">
                        {[
                            { label: "Yes", value: true },
                            { label: "No", value: false },
                        ].map((opt) => (
                            <label
                                key={`ownership-${opt.label}`}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm
                                    ${formData.taswaterChangeOwnership === opt.value
                                        ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="changeOwnership"
                                    checked={formData.taswaterChangeOwnership === opt.value}
                                    onChange={() => updateFormData({ taswaterChangeOwnership: opt.value })}
                                    className="sr-only"
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>

                    {/* Settlement Date - conditional */}
                    {formData.taswaterChangeOwnership && (
                        <div className="ml-0 mt-3 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                            <label className="field-label flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                                What was the settlement date? *
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formData.taswaterSettlementDate}
                                    onChange={(e) => {
                                        let v = e.target.value.replace(/[^0-9/]/g, "");
                                        const digits = v.replace(/\//g, "");
                                        if (digits.length >= 5) {
                                            v = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
                                        } else if (digits.length >= 3) {
                                            v = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                                        }
                                        updateFormData({ taswaterSettlementDate: v });
                                        clearError("taswaterSettlementDate");
                                    }}
                                    placeholder="dd/mm/yyyy"
                                    maxLength={10}
                                    className={`form-input pr-10 ${errors.taswaterSettlementDate ? "border-red-500" : ""}`}
                                />
                                {/* Calendar icon button */}
                                <button
                                    type="button"
                                    onClick={openDatePicker}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-teal-100 transition-colors cursor-pointer"
                                    aria-label="Open date picker"
                                >
                                    <Calendar className="w-4 h-4 text-teal-600" />
                                </button>
                                {/* Hidden native date input */}
                                <input
                                    ref={datePickerRef}
                                    type="date"
                                    className="sr-only"
                                    tabIndex={-1}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) {
                                            const [y, m, d] = val.split("-");
                                            updateFormData({ taswaterSettlementDate: `${d}/${m}/${y}` });
                                            clearError("taswaterSettlementDate");
                                        }
                                    }}
                                />
                            </div>
                            {errors.taswaterSettlementDate && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.taswaterSettlementDate}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

