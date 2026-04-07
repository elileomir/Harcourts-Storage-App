"use client";

import type { ExpenseApprovalFormData } from "@/lib/expense-approval/types";
import {
    MapPin,
    CheckCircle2,
    Droplets,
    FileText,
    Users,
    Briefcase,
    Pencil,
} from "lucide-react";

interface ReviewSectionProps {
    formData: ExpenseApprovalFormData;
    onGoToStep: (step: number) => void;
}

function SectionHeader({
    icon: Icon,
    title,
    stepIndex,
    onEdit,
}: {
    icon: React.ElementType;
    title: string;
    stepIndex: number;
    onEdit: (step: number) => void;
}) {
    return (
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-harcourts-blue" />
                <h3 className="font-semibold text-harcourts-navy text-sm">{title}</h3>
            </div>
            <button
                type="button"
                onClick={() => onEdit(stepIndex)}
                className="flex items-center gap-1 text-xs text-harcourts-blue hover:underline"
            >
                <Pencil className="w-3 h-3" />
                Edit
            </button>
        </div>
    );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs font-medium text-gray-800 text-right max-w-[60%] break-words">
                {value || <span className="text-gray-300 italic">Not provided</span>}
            </span>
        </div>
    );
}

export function ReviewSection({ formData, onGoToStep }: ReviewSectionProps) {
    const propertyAddress = [
        formData.propertyStreet,
        formData.propertySuburb,
        formData.propertyState,
        formData.propertyPostcode,
    ]
        .filter(Boolean)
        .join(", ");

    const servicesSelected = [
        formData.councilRates ? "Council Rates" : null,
        formData.landTax ? "Land Tax" : null,
        formData.taswater ? "TasWater" : null,
    ].filter(Boolean);

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-green-800 font-medium">Ready to Submit</p>
                    <p className="text-xs text-green-600 mt-0.5">
                        Please review all details below before submitting. Once submitted, this will be
                        sent for processing via DocuSign.
                    </p>
                </div>
            </div>

            {/* Property & Services */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
                <SectionHeader icon={MapPin} title="Property & Services" stepIndex={0} onEdit={onGoToStep} />
                <ReviewRow label="Property Address" value={propertyAddress} />
                {formData.propertyPID && <ReviewRow label="PID" value={formData.propertyPID} />}
                <ReviewRow
                    label="Services Selected"
                    value={
                        <div className="flex flex-wrap gap-1 justify-end">
                            {servicesSelected.map((s) => (
                                <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-harcourts-blue/10 text-harcourts-blue font-medium">
                                    {s}
                                </span>
                            ))}
                        </div>
                    }
                />
            </div>

            {/* Ownership */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
                <SectionHeader icon={Users} title="Ownership Structure" stepIndex={1} onEdit={onGoToStep} />
                <ReviewRow label="Structure" value={formData.ownershipStructure} />

                {formData.ownershipStructure === "Trust" && (
                    <>
                        <ReviewRow label="Trust Name" value={formData.trustName} />
                        <ReviewRow label="Trustee Type" value={formData.trusteeType === "company" ? "Company" : "Individual"} />
                        {formData.trustScheduleFileName && (
                            <ReviewRow
                                label="Trust Schedule"
                                value={
                                    <span className="flex items-center gap-1">
                                        <FileText className="w-3 h-3 text-purple-500" />
                                        {formData.trustScheduleFileName}
                                    </span>
                                }
                            />
                        )}
                    </>
                )}

                {(formData.ownershipStructure === "Company" ||
                    (formData.ownershipStructure === "Trust" && formData.trusteeType === "company")) && (
                        <>
                            <ReviewRow label="Company Name" value={formData.companyName} />
                            <ReviewRow label="ACN" value={formData.companyACN} />
                            {formData.asicRegisterFileName && (
                                <ReviewRow
                                    label="ASIC Register"
                                    value={
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3 text-blue-500" />
                                            {formData.asicRegisterFileName}
                                        </span>
                                    }
                                />
                            )}
                        </>
                    )}

                {/* Owner Details */}
                {formData.owners.slice(0, formData.ownerCount).map((owner, i) => {
                    let label = `Owner ${i + 1}`;
                    if (formData.ownershipStructure === "Company" || (formData.ownershipStructure === "Trust" && formData.trusteeType === "company")) {
                        label = !formData.hasMultipleDirectors ? "Director / Secretary" : i === 0 ? "Director" : "Secretary";
                    } else if (formData.ownershipStructure === "Trust" && formData.trusteeType === "individual") {
                        label = `Trustee ${formData.ownerCount > 1 ? i + 1 : ""}`.trim();
                    }
                    return (
                        <div key={i} className={`${i > 0 ? "pt-2 mt-2 border-t border-gray-100" : "pt-1"}`}>
                            <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
                            <ReviewRow label="Name" value={owner.fullName} />
                            <ReviewRow label="Email" value={owner.email} />
                            <ReviewRow label="Mobile" value={`${owner.mobileCountryCode} ${owner.mobileNumber}`} />
                            <ReviewRow
                                label="Address"
                                value={[owner.street, owner.suburb, owner.state, owner.postcode].filter(Boolean).join(", ")}
                            />
                        </div>
                    );
                })}
            </div>

            {/* TasWater (conditional) */}
            {formData.taswater && (
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <SectionHeader icon={Droplets} title="TasWater Details" stepIndex={2} onEdit={onGoToStep} />
                    <ReviewRow label="Account Number" value={formData.taswaterAccountNo} />
                    <ReviewRow label="Account Name" value={formData.taswaterAccountName} />
                    <ReviewRow
                        label="Postal Address"
                        value={[
                            formData.taswaterPostalStreet,
                            formData.taswaterPostalSuburb,
                            formData.taswaterPostalState,
                            formData.taswaterPostalPostcode,
                        ]
                            .filter(Boolean)
                            .join(", ")}
                    />
                    <ReviewRow label="Cancel BPAY" value={formData.taswaterCancelBpay ? "Yes" : "No"} />
                    <ReviewRow label="Cancel Direct Debit" value={formData.taswaterCancelDirectDebit ? "Yes" : "No"} />
                    <ReviewRow label="Change of Ownership" value={formData.taswaterChangeOwnership ? "Yes" : "No"} />
                    {formData.taswaterChangeOwnership && (
                        <ReviewRow label="Settlement Date" value={formData.taswaterSettlementDate} />
                    )}
                </div>
            )}

            {/* Authorization */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                        By submitting this form, you authorise Harcourts Ulverstone &amp; Penguin to collect
                        and process payments for the selected services on your behalf. A DocuSign document
                        will be sent to you for formal signature.
                    </p>
                </div>
            </div>
        </div>
    );
}
