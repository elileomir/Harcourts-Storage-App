"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Clock,
    Loader2,
    CheckCircle2,
    XCircle,
    Trash2,
    Save,
    History,
    AlertTriangle,
    ExternalLink,
    Mail,
    MessageSquare,
    X,
} from "lucide-react";
import { FormStepper, FormNavigation } from "@/components/saa/FormStepper";
import { PropertyServiceSection } from "@/components/expense-approval/PropertyServiceSection";
import { OwnershipSection } from "@/components/expense-approval/OwnershipSection";
import { TasWaterSection } from "@/components/expense-approval/TasWaterSection";
import { ReviewSection } from "@/components/expense-approval/ReviewSection";
import {
    initialExpenseApprovalFormData,
    type ExpenseApprovalFormData,
} from "@/lib/expense-approval/types";
import { validateStep, getEffectiveSteps } from "@/lib/expense-approval/validation";
import { submitExpenseApproval } from "@/lib/expense-approval/api";
import {
    getHistory,
    saveSubmission,
    loadSubmission,
    deleteSubmission,
    getRelativeTime,
    type ExpenseApprovalHistoryEntry,
} from "@/lib/expense-approval/historyStorage";

// ============================================
// History Modal
// ============================================
function HistoryModal({
    isOpen,
    onClose,
    onLoad,
    onDelete,
    entries,
    loading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    entries: ExpenseApprovalHistoryEntry[];
    loading: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-teal-600" />
                        <h3 className="text-lg font-bold text-harcourts-navy">
                            Approval History
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[50vh] custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            No submissions yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="text-sm font-semibold text-harcourts-navy truncate">
                                                {entry.propertyAddress}
                                            </h4>
                                            <span
                                                className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${entry.status === "completed"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-amber-50 text-amber-600"
                                                    }`}
                                            >
                                                {entry.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{entry.ownerName}</span>
                                            {entry.servicesSelected && (
                                                <>
                                                    <span>·</span>
                                                    <span>{entry.servicesSelected}</span>
                                                </>
                                            )}
                                            <span>·</span>
                                            <span>{getRelativeTime(entry.updatedAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onLoad(entry.id)}
                                            className="px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                        >
                                            Load
                                        </button>
                                        {entry.isOwn && (
                                            <button
                                                onClick={() => onDelete(entry.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ============================================
// Delete Confirmation Modal
// ============================================
function DeleteConfirmModal({
    isOpen,
    entryName,
    isDeleting,
    onConfirm,
    onCancel,
}: {
    isOpen: boolean;
    entryName: string;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-harcourts-navy mb-2">
                        Delete Submission?
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-1">
                        This will permanently delete:
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mb-6 truncate">
                        {entryName}
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================
// Success Modal (SAA-style with DocuSign button)
// ============================================
function SuccessModal({
    isOpen,
    ownerName,
    docusignUrl,
    onClose,
    onNewForm,
}: {
    isOpen: boolean;
    ownerName?: string;
    docusignUrl?: string;
    onClose: () => void;
    onNewForm: () => void;
}) {
    if (!isOpen) return null;

    const handleOpenDocuSign = () => {
        if (docusignUrl) {
            window.open(docusignUrl, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in"
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Approval Submitted!</h2>
                            <p className="text-white/80 text-sm">
                                Successfully sent for signing
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <Mail className="w-5 h-5 text-harcourts-blue mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-gray-700">
                                An email has been sent to{" "}
                                <strong className="text-harcourts-navy">{ownerName || "the owner"}</strong>{" "}
                                for signing.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <MessageSquare className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-600 text-sm">
                            You will be notified via Teams when they complete it.
                        </p>
                    </div>

                    {/* In-Person Signing Option */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <ExternalLink className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 text-sm">
                            <strong className="text-amber-700">In-Person Signing:</strong>{" "}
                            Use the button below to open DocuSign on this device for
                            immediate signing.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex flex-col gap-3">
                    {/* DocuSign Button — always visible */}
                    <button
                        onClick={handleOpenDocuSign}
                        disabled={!docusignUrl}
                        className={`w-full px-4 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            docusignUrl
                                ? "bg-harcourts-blue text-white hover:bg-harcourts-blue-dark"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        {docusignUrl ? (
                            <>
                                <ExternalLink className="w-5 h-5" />
                                Open DocuSign for In-Person Signing
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating DocuSign link...
                            </>
                        )}
                    </button>

                    {/* Bottom Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        <button onClick={onNewForm} className="flex-1 btn-primary">
                            New Approval
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================
// Main Page Component
// ============================================
export default function ExpenseApprovalFormPage() {
    const [formData, setFormData] = useState<ExpenseApprovalFormData>(initialExpenseApprovalFormData);
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [existingId, setExistingId] = useState<string | undefined>(undefined);
    const [showHistory, setShowHistory] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successData, setSuccessData] = useState<{ ownerName?: string; docusignUrl?: string } | null>(null);
    const [historyEntries, setHistoryEntries] = useState<ExpenseApprovalHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dynamic steps
    const effectiveSteps = useMemo(() => getEffectiveSteps(formData), [formData]);
    const currentStepId = effectiveSteps[currentStep]?.id ?? 0;
    const isLastStep = currentStep === effectiveSteps.length - 1;

    const updateFormData = useCallback(
        (updates: Partial<ExpenseApprovalFormData>) => {
            setFormData((prev) => ({ ...prev, ...updates }));
        },
        []
    );

    // Load history
    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        const entries = await getHistory();
        setHistoryEntries(entries);
        setHistoryLoading(false);
    }, []);

    // Step change with validation
    const handleStepChange = (displayIndex: number) => {
        if (displayIndex > currentStep) {
            const stepErrors = validateStep(currentStepId, formData);
            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                return;
            }
        }
        setErrors({});
        setCurrentStep(displayIndex);
    };

    const handleGoToStep = (actualStepId: number) => {
        const displayIndex = effectiveSteps.findIndex((s) => s.id === actualStepId);
        if (displayIndex >= 0) {
            setErrors({});
            setCurrentStep(displayIndex);
        }
    };

    // Save draft
    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            const id = await saveSubmission(formData, "draft", existingId);
            if (id) {
                setExistingId(id);
            }
        } catch (err) {
            console.error("Save draft error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Submit
    const handleSubmit = async () => {
        // Validate all steps except the review step
        for (let i = 0; i < effectiveSteps.length - 1; i++) {
            const stepId = effectiveSteps[i].id;
            const stepErrors = validateStep(stepId, formData);
            if (Object.keys(stepErrors).length > 0) {
                setErrors(stepErrors);
                setCurrentStep(i);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const result = await submitExpenseApproval(formData, existingId);
            if (result.success) {
                if (existingId) {
                    await saveSubmission(formData, "completed", existingId);
                }
                setSuccessData({
                    ownerName: result.ownerName,
                    docusignUrl: result.docusignUrl,
                });
                setShowSuccess(true);
            } else {
                alert(`Submission failed: ${result.error}`);
            }
        } catch (err) {
            console.error("Submit error:", err);
            alert("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Load submission
    const handleLoadSubmission = async (id: string) => {
        const data = await loadSubmission(id);
        if (data) {
            setFormData(data);
            setExistingId(id);
            setCurrentStep(0);
            setShowHistory(false);
        }
    };

    // Delete submission
    const handleDeleteSubmission = (id: string) => {
        const entry = historyEntries.find((e) => e.id === id);
        setDeleteTarget({ id, name: entry?.propertyAddress || "this submission" });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        const success = await deleteSubmission(deleteTarget.id);
        if (success) {
            setHistoryEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        }
        setIsDeleting(false);
        setDeleteTarget(null);
    };

    // New form
    const handleNewForm = () => {
        setFormData(initialExpenseApprovalFormData);
        setCurrentStep(0);
        setExistingId(undefined);
        setErrors({});
        setShowSuccess(false);
    };

    // Open history
    const handleOpenHistory = () => {
        fetchHistory();
        setShowHistory(true);
    };

    // Auto-save on step change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.propertyStreet || formData.owners[0]?.fullName) {
                saveSubmission(formData, "draft", existingId).then((id) => {
                    if (id && !existingId) setExistingId(id);
                });
            }
        }, 2000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep]);

    // Always allow clicking Next — validation errors will show on click via handleStepChange
    const canProceed = true;

    return (
        <div className="max-w-4xl mx-auto pb-12 w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-harcourts-navy tracking-tight">
                            Expense Approval
                        </h1>
                        <p className="text-gray-500 mt-2 text-base">
                            Complete the landlord expense approval for property services.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all border border-gray-200"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            Save Draft
                        </button>
                        <button
                            onClick={handleOpenHistory}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all border border-gray-200"
                        >
                            <Clock className="w-3.5 h-3.5" />
                            History
                        </button>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                    <FileText className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-teal-800">
                        <p className="font-semibold mb-1">How this works</p>
                        <p className="text-teal-600 leading-relaxed">
                            Complete the expense approval details below and submit. The information will
                            be sent for DocuSign processing and the landlord will receive documents for signature.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Form Stepper */}
            <FormStepper
                steps={effectiveSteps}
                currentStep={currentStep}
                onStepChange={handleStepChange}
                canProceed={canProceed}
                isLastStep={isLastStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                showNavigation
                showStepIndicators
                hideNavigation
            />

            {/* Step Content */}
            <motion.div className="mt-8" initial={false}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                            {currentStepId === 0 && (
                                <PropertyServiceSection
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    errors={errors}
                                    setErrors={setErrors}
                                />
                            )}
                            {currentStepId === 1 && (
                                <OwnershipSection
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    errors={errors}
                                    setErrors={setErrors}
                                />
                            )}
                            {currentStepId === 2 && (
                                <TasWaterSection
                                    formData={formData}
                                    updateFormData={updateFormData}
                                    errors={errors}
                                    setErrors={setErrors}
                                />
                            )}
                            {currentStepId === 3 && (
                                <ReviewSection
                                    formData={formData}
                                    onGoToStep={handleGoToStep}
                                />
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Bottom Navigation */}
            <div className="mt-6">
                <FormNavigation
                    currentStep={currentStep}
                    totalSteps={effectiveSteps.length}
                    canProceed={canProceed}
                    isLastStep={isLastStep}
                    isSubmitting={isSubmitting}
                    onPrev={() => currentStep > 0 && handleStepChange(currentStep - 1)}
                    onNext={() => currentStep < effectiveSteps.length - 1 && handleStepChange(currentStep + 1)}
                    onSubmit={handleSubmit}
                    submitLabel="Submit Approval"
                    submittingLabel="Submitting..."
                />
            </div>

            {/* Modals */}
            {showHistory && (
                <HistoryModal
                    isOpen={showHistory}
                    onClose={() => setShowHistory(false)}
                    onLoad={handleLoadSubmission}
                    onDelete={handleDeleteSubmission}
                    entries={historyEntries}
                    loading={historyLoading}
                />
            )}
            {showSuccess && (
                <SuccessModal
                    isOpen={showSuccess}
                    ownerName={successData?.ownerName}
                    docusignUrl={successData?.docusignUrl}
                    onClose={() => setShowSuccess(false)}
                    onNewForm={handleNewForm}
                />
            )}
            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                entryName={deleteTarget?.name || ""}
                isDeleting={isDeleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
