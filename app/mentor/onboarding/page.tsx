"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/common/Card";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import Step1BasicInfo from "@/components/onboarding/Step1BasicInfo";
import Step2ProfileDetails from "@/components/onboarding/Step2ProfileDetails";
import Step3Pricing from "@/components/onboarding/Step3Pricing";
import Step4Availability from "@/components/onboarding/Step4Availability";
import Step5Payment from "@/components/onboarding/Step5Payment";
import { MentorCategory, OfferType } from "@prisma/client";
import Spinner from "@/components/common/Spinner";

interface OnboardingData {
  step1?: {
    name: string;
    category: MentorCategory;
    tagline: string;
  };
  step2?: {
    bio: string;
    profileImage: string;
    socialLinks: {
      twitter?: string;
      linkedin?: string;
      website?: string;
      youtube?: string;
    };
  };
  step3?: {
    offerType: OfferType;
    accessPrice?: number;
    hourlyRate?: number;
  };
}

export default function MentorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [error, setError] = useState("");

  const steps = [
    {
      step: 1,
      title: "Basic Info",
      description: "Set up your name, category, and tagline",
      isComplete: !!onboardingData.step1,
    },
    {
      step: 2,
      title: "Profile",
      description: "Add your bio and profile image",
      isComplete: !!onboardingData.step2,
    },
    {
      step: 3,
      title: "Pricing",
      description: "Set your prices and offers",
      isComplete: !!onboardingData.step3,
    },
    {
      step: 4,
      title: "Availability",
      description: "Set your schedule",
      isComplete: currentStep > 4,
    },
    {
      step: 5,
      title: "Payment",
      description: "Connect Stripe",
      isComplete: currentStep > 5,
    },
  ];

  const saveStep = async (stepNumber: number, data: Record<string, unknown>) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: stepNumber,
          data,
        }),
      });

      const result = await res.json();

      if (!result.ok) {
        setError(result.error || "Failed to save progress");
        setLoading(false);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Save error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Next = async (data: OnboardingData["step1"]) => {
    if (!data) return;

    const success = await saveStep(1, data);
    if (success) {
      setOnboardingData({ ...onboardingData, step1: data });
      setCurrentStep(2);
    }
  };

  const handleStep2Next = async (data: OnboardingData["step2"]) => {
    if (!data) return;

    const success = await saveStep(2, data);
    if (success) {
      setOnboardingData({ ...onboardingData, step2: data });
      setCurrentStep(3);
    }
  };

  const handleStep3Next = async (data: OnboardingData["step3"]) => {
    if (!data) return;

    const success = await saveStep(3, data);
    if (success) {
      setOnboardingData({ ...onboardingData, step3: data });
      setCurrentStep(4);
    }
  };

  const handleStep4Next = async () => {
    const success = await saveStep(4, {});
    if (success) {
      setCurrentStep(5);
    }
  };

  const handleComplete = async () => {
    const success = await saveStep(5, {});
    if (success) {
      // Redirect to mentor dashboard
      router.push("/mentor-dashboard");
    }
  };

  const skipAvailability = onboardingData.step3?.offerType === "ACCESS";

  return (
    <section className="section min-h-screen">
      <div className="container max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="h1 mb-4">Mentor Onboarding</h1>
          <p className="text-white/60 text-lg">
            Let&apos;s get your mentor profile set up so students can find you
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <OnboardingProgress currentStep={currentStep} steps={steps} />

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            )}

            {!loading && (
              <>
                {currentStep === 1 && (
                  <Step1BasicInfo
                    initialData={onboardingData.step1}
                    onNext={handleStep1Next}
                  />
                )}

                {currentStep === 2 && (
                  <Step2ProfileDetails
                    initialData={onboardingData.step2}
                    onNext={handleStep2Next}
                    onBack={() => setCurrentStep(1)}
                  />
                )}

                {currentStep === 3 && (
                  <Step3Pricing
                    initialData={onboardingData.step3}
                    onNext={handleStep3Next}
                    onBack={() => setCurrentStep(2)}
                  />
                )}

                {currentStep === 4 && (
                  <Step4Availability
                    skipAvailability={skipAvailability}
                    onNext={handleStep4Next}
                    onBack={() => setCurrentStep(3)}
                  />
                )}

                {currentStep === 5 && (
                  <Step5Payment
                    onComplete={handleComplete}
                    onBack={() => setCurrentStep(4)}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
