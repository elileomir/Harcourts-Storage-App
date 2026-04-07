import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  shortTitle: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  canProceed: boolean;
  isLastStep: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  showNavigation?: boolean;
  showStepIndicators?: boolean;
  /** When true, navigation buttons are NOT rendered inside the stepper. Use <FormNavigation /> separately. */
  hideNavigation?: boolean;
}

export function FormStepper({
  steps,
  currentStep,
  onStepChange,
  canProceed,
  isLastStep,
  onSubmit,
  isSubmitting,
  showNavigation = true,
  showStepIndicators = true,
  hideNavigation = false,
}: FormStepperProps) {
  const goNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  // Check if we have 5 or more steps (Annexure enabled)
  const isCompactMode = steps.length >= 5;

  return (
    <div className="space-y-6">
      {/* Step Indicators */}
      {showStepIndicators && (
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${isCompactMode ? "flex-col" : ""}`}
            >
              {/* Step Label - Above circle in compact mode, beside in normal */}
              {isCompactMode && (
                <span
                  className={`
                  text-xs font-medium mb-1 text-center hidden md:block
                  ${index === currentStep
                      ? "text-harcourts-blue"
                      : index < currentStep
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                `}
                >
                  {step.shortTitle}
                </span>
              )}

              <div className="flex items-center">
                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => onStepChange(index)}
                  className={`
                  ${isCompactMode ? "w-8 h-8" : "w-8 h-8 md:w-10 md:h-10"} 
                  rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-200
                  ${index < currentStep
                      ? "bg-green-500 text-white"
                      : index === currentStep
                        ? "bg-harcourts-blue text-white ring-4 ring-blue-100"
                        : "bg-gray-200 text-gray-500"
                    }
                `}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </button>

                {/* Step Label - Beside circle in normal mode only */}
                {!isCompactMode && (
                  <span
                    className={`
                    ml-2 text-sm font-medium hidden md:block
                    ${index === currentStep
                        ? "text-harcourts-blue"
                        : "text-gray-500"
                      }
                  `}
                  >
                    {step.shortTitle}
                  </span>
                )}

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                    h-0.5 transition-colors
                    ${isCompactMode
                        ? "w-4 md:w-8 lg:w-12 mx-1 md:mx-2"
                        : "w-8 md:w-16 lg:w-24 mx-2 md:mx-4"
                      }
                    ${index < currentStep ? "bg-green-500" : "bg-gray-200"}
                  `}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Step Title (Mobile) */}
      {showStepIndicators && (
        <div className="md:hidden text-center">
          <h2 className="text-lg font-semibold text-harcourts-navy">
            {steps[currentStep]?.title}
          </h2>
          <p className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      )}

      {/* Inline Navigation Buttons (legacy — only when not hidden) */}
      {showNavigation && !hideNavigation && (
        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          canProceed={canProceed}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          onPrev={goPrev}
          onNext={goNext}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}

// ─── Standalone Navigation Buttons ──────────────────────────────

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submittingLabel?: string;
}

export function FormNavigation({
  currentStep,
  canProceed,
  isLastStep,
  isSubmitting,
  onPrev,
  onNext,
  onSubmit,
  submitLabel = "Generate Agreement",
  submittingLabel = "Creating Agreement & Sending...",
}: FormNavigationProps) {
  return (
    <div className="flex justify-between pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentStep === 0}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${currentStep === 0
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:bg-gray-100"
          }
        `}
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed || isSubmitting}
          className="btn-primary flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {submittingLabel}
            </>
          ) : (
            <>
              {submitLabel}
              <Check className="w-5 h-5" />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="btn-primary flex items-center gap-2"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
