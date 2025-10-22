"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import FormFieldError from "@/components/common/FormFieldError";
import { Clock } from "lucide-react";

interface Step4AvailabilityProps {
  onNext: () => void;
  onBack: () => void;
  skipAvailability?: boolean; // If ACCESS only, can skip
}

export default function Step4Availability({
  onNext,
  onBack,
  skipAvailability,
}: Step4AvailabilityProps) {
  const [error, setError] = useState("");

  // For now, we'll just have a placeholder that acknowledges the step
  // Full availability scheduling can be done in mentor dashboard later
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    onNext();
  };

  if (skipAvailability) {
    // Auto-skip for ACCESS-only mentors
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Availability</h2>
          <p className="text-white/60">
            Since you&apos;re offering ACCESS passes only, you don&apos;t need to set up a scheduling calendar.
          </p>
        </div>

        <div className="p-6 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">No Scheduling Required</h3>
              <p className="text-sm text-white/60">
                You can manage your community access and content on your own schedule.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="ghost" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button type="button" variant="primary" size="lg" onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Availability</h2>
        <p className="text-white/60">
          Set up your availability for 1-on-1 sessions.
        </p>
      </div>

      <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-start gap-3 mb-4">
          <Clock className="w-5 h-5 text-primary-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-1">Set Up Later</h3>
            <p className="text-sm text-white/60 mb-3">
              You can set your detailed weekly availability from your mentor dashboard after completing onboarding.
              This will help students know when they can book sessions with you.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-white/60">
          <p>After onboarding, you&apos;ll be able to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Set recurring weekly availability</li>
            <li>Block specific dates for vacations or appointments</li>
            <li>Adjust your schedule anytime</li>
            <li>Set your timezone preferences</li>
          </ul>
        </div>
      </div>

      {error && <FormFieldError error={error} />}

      <div className="flex justify-between">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" size="lg">
          Continue
        </Button>
      </div>
    </form>
  );
}
