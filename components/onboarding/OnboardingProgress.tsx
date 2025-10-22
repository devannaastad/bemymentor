"use client";

import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  steps: Array<{
    step: number;
    title: string;
    description: string;
    isComplete: boolean;
  }>;
}

export default function OnboardingProgress({
  currentStep,
  steps,
}: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((stepInfo, index) => (
          <div key={stepInfo.step} className="flex-1">
            <div className="flex items-center">
              {/* Step Circle */}
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    stepInfo.isComplete
                      ? "bg-primary-500 border-primary-500 text-black"
                      : stepInfo.step === currentStep
                      ? "bg-primary-500/20 border-primary-500 text-primary-400"
                      : "bg-white/5 border-white/20 text-white/40"
                  }`}
                >
                  {stepInfo.isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{stepInfo.step}</span>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    steps[index + 1].isComplete || stepInfo.isComplete
                      ? "bg-primary-500"
                      : "bg-white/20"
                  }`}
                />
              )}
            </div>

            {/* Step Label */}
            <div className="mt-2">
              <p
                className={`text-xs font-medium ${
                  stepInfo.step === currentStep
                    ? "text-primary-400"
                    : stepInfo.isComplete
                    ? "text-white/80"
                    : "text-white/40"
                }`}
              >
                {stepInfo.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
