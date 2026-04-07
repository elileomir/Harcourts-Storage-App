"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Loader2,
    CheckCircle2,
    Shield,
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

// ── Success Screen ──────────────────────────────────────────────────────
function SuccessScreen({ onNewForm }: { onNewForm: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-16"
        >
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#001F49] mb-3">
                Approval Submitted Successfully!
            </h2>
            <p className="text-gray-500 mb-2 leading-relaxed">
                Thank you. Your expense approval request has been received and a
                DocuSign document will be sent to you for formal signature.
            </p>
            <p className="text-sm text-gray-400 mb-8">
                You will be contacted by our office if any further information is required.
            </p>
            <button
                onClick={onNewForm}
                className="px-6 py-3 rounded-xl bg-[#001F49] text-white font-semibold text-sm hover:bg-[#001F49]/90 transition-colors"
            >
                Submit Another Approval
            </button>
        </motion.div>
    );
}

// ── Main Page ───────────────────────────────────────────────────────────
export default function PublicExpenseApprovalPage() {
    const [formData, setFormData] = useState<ExpenseApprovalFormData>(initialExpenseApprovalFormData);
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [honeypot, setHoneypot] = useState("");

    // Dynamic steps — skip TasWater step if not selected
    const effectiveSteps = useMemo(() => getEffectiveSteps(formData), [formData]);

    // Map display index to actual step ID
    const currentStepId = effectiveSteps[currentStep]?.id ?? 0;
    const isLastStep = currentStep === effectiveSteps.length - 1;

    const updateFormData = useCallback(
        (updates: Partial<ExpenseApprovalFormData>) => {
            setFormData((prev) => ({ ...prev, ...updates }));
        },
        []
    );

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

    const handleSubmit = async () => {
        // Validate all steps before submission
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
        setSubmitError(null);

        try {
            const res = await fetch("/api/expense-approval/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formData,
                    isPublic: true,
                    _hp_field: honeypot,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    setSubmitError("Too many submissions. Please wait and try again later.");
                } else {
                    setSubmitError(data.error || "Submission failed. Please try again.");
                }
                return;
            }

            if (data.success) {
                setShowSuccess(true);
            } else {
                setSubmitError(data.error || "Submission failed.");
            }
        } catch {
            setSubmitError("Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewForm = () => {
        setFormData(initialExpenseApprovalFormData);
        setCurrentStep(0);
        setErrors({});
        setShowSuccess(false);
        setSubmitError(null);
    };

    if (showSuccess) {
        return <SuccessScreen onNewForm={handleNewForm} />;
    }

    // Always allow clicking Next — validation errors will show on click via handleStepChange
    const canProceed = true;

    return (
        <div className="w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-[#001F49] tracking-tight">
                    Landlord Expense Approval
                </h1>
                <p className="text-gray-500 mt-2 text-base">
                    Authorise us to collect and process payments on your behalf.
                </p>

                <div className="flex items-start gap-3 p-4 mt-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                    <FileText className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-teal-800">
                        <p className="font-semibold mb-1">How this works</p>
                        <p className="text-teal-600 leading-relaxed">
                            Complete the form below to authorise us to collect and pay council rates, land tax,
                            and/or TasWater bills on your behalf. A DocuSign document will be sent for your signature.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Honeypot — invisible to real users */}
            <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden">
                <label htmlFor="hp_website">Website</label>
                <input
                    id="hp_website"
                    name="_hp_field"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                />
            </div>

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

            {/* Submit Error */}
            {submitError && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2"
                >
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {submitError}
                </motion.div>
            )}

            {/* Step Content */}
            <motion.div className="mt-8 relative z-50" initial={false}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-50"
                    >
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm relative z-50">
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
            <div className="mt-6 relative z-10">
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

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Your information is encrypted and securely transmitted</span>
            </div>

            {/* Submitting Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                        <span className="text-gray-700 font-medium">Submitting your approval...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
