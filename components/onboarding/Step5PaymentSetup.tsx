"use client";

import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import { CheckCircle, AlertCircle, ExternalLink, DollarSign } from "lucide-react";

interface Step5PaymentSetupProps {
  initialData?: {
    stripeConnectId?: string;
    stripeOnboarded?: boolean;
  };
  onNext: () => void;
  onBack: () => void;
}

export default function Step5PaymentSetup({
  initialData,
  onNext,
  onBack,
}: Step5PaymentSetupProps) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(
    initialData?.stripeOnboarded || false
  );
  const [hasAccount, setHasAccount] = useState(!!initialData?.stripeConnectId);

  // Check onboarding status on mount and when returning from Stripe
  useEffect(() => {
    checkOnboardingStatus();

    // Listen for query param changes (when returning from Stripe)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      // Wait a bit for Stripe webhook to process
      setTimeout(() => {
        checkOnboardingStatus();
      }, 2000);
    }
  }, []);

  async function checkOnboardingStatus() {
    setChecking(true);
    try {
      const res = await fetch("/api/mentor/stripe-connect");
      const data = await res.json();

      if (data.ok) {
        setHasAccount(data.data.hasAccount);
        setIsOnboarded(data.data.isOnboarded);
      }
    } catch (err) {
      console.error("Failed to check onboarding status:", err);
    } finally {
      setChecking(false);
    }
  }

  async function handleConnectStripe() {
    setLoading(true);
    try {
      const res = await fetch("/api/mentor/stripe-connect", {
        method: "POST",
      });

      const data = await res.json();

      if (data.ok && data.data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.data.url;
      } else {
        alert("Failed to create Stripe account. Please try again.");
      }
    } catch (err) {
      console.error("Failed to connect Stripe:", err);
      alert("Failed to connect Stripe. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-4 text-white/60">Checking payment setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment Setup</h2>
        <p className="text-white/60">
          Connect your Stripe account to receive payouts for your mentorship services.
        </p>
      </div>

      {/* Status Card */}
      <div
        className={`rounded-lg border p-6 ${
          isOnboarded
            ? "border-emerald-500/20 bg-emerald-500/10"
            : "border-amber-500/20 bg-amber-500/10"
        }`}
      >
        <div className="flex items-start gap-4">
          {isOnboarded ? (
            <CheckCircle className="h-8 w-8 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-8 w-8 text-amber-400 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              {isOnboarded
                ? "Payment Setup Complete!"
                : hasAccount
                ? "Complete Your Stripe Onboarding"
                : "Connect Your Stripe Account"}
            </h3>
            <p className="text-sm text-white/70 mb-4">
              {isOnboarded
                ? "Your Stripe account is fully set up. You can now receive payments from your mentees."
                : hasAccount
                ? "You've started the Stripe onboarding process but haven't completed it yet. Click below to continue."
                : "We use Stripe to securely transfer your earnings. Setup takes about 2-3 minutes."}
            </p>

            {!isOnboarded && (
              <Button
                onClick={handleConnectStripe}
                disabled={loading}
                variant="primary"
                className="gap-2"
              >
                {loading ? (
                  "Loading..."
                ) : hasAccount ? (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Continue Stripe Setup
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4" />
                    Connect Stripe Account
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Platform Fee
          </h4>
          <p className="text-sm text-white/60">
            We charge a 15% platform fee on all bookings. You keep 85% of every payment.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Payout Schedule
          </h4>
          <p className="text-sm text-white/60">
            Earnings are automatically transferred to your bank account within 2-7 business
            days after session completion.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            Secure & Safe
          </h4>
          <p className="text-sm text-white/60">
            Stripe handles all payment processing securely. We never have access to your bank
            details.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Track Earnings
          </h4>
          <p className="text-sm text-white/60">
            View your earnings, payout history, and financial reports in your mentor
            dashboard.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost">
          Back
        </Button>
        <Button onClick={onNext} variant="primary" disabled={!isOnboarded}>
          {isOnboarded ? "Complete Setup" : "Complete Payment Setup First"}
        </Button>
      </div>
    </div>
  );
}
