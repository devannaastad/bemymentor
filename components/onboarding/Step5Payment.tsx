"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import FormFieldError from "@/components/common/FormFieldError";
import { CreditCard, ExternalLink, Shield } from "lucide-react";

interface Step5PaymentProps {
  onComplete: () => void;
  onBack: () => void;
  stripeOnboarded?: boolean;
}

export default function Step5Payment({
  onComplete,
  onBack,
  stripeOnboarded,
}: Step5PaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnectStripe = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Failed to create Stripe Connect onboarding link");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Connect onboarding
      window.location.href = data.url;
    } catch (err) {
      console.error("Stripe Connect error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleSkipForNow = () => {
    // Allow skipping but warn that they can't receive payments yet
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Setup</h2>
        <p className="text-white/60">
          Connect your Stripe account to receive payments from students.
        </p>
      </div>

      {stripeOnboarded ? (
        <div className="p-6 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">Stripe Connected</h3>
              <p className="text-sm text-white/60">
                Your Stripe account is connected and ready to receive payments!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-primary-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">Why Stripe?</h3>
                <p className="text-sm text-white/60">
                  We use Stripe Connect to securely handle payments. Your earnings are transferred
                  directly to your bank account.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-white/60">
              <p className="font-medium text-white/80">What you&apos;ll need:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Business or personal tax information</li>
                <li>Bank account details for payouts</li>
                <li>Government-issued ID (for verification)</li>
              </ul>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleConnectStripe}
                loading={loading}
                className="w-full"
              >
                Connect with Stripe
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-white/60">
              <strong className="text-white/80">Note:</strong> You can skip this step for now,
              but you won&apos;t be able to receive payments until you complete Stripe setup.
              You can always connect Stripe later from your dashboard.
            </p>
          </div>
        </>
      )}

      {error && <FormFieldError error={error} />}

      <div className="flex justify-between">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          Back
        </Button>
        {stripeOnboarded ? (
          <Button type="button" variant="primary" size="lg" onClick={onComplete}>
            Complete Onboarding
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={handleSkipForNow}
          >
            Skip for Now
          </Button>
        )}
      </div>
    </div>
  );
}
