"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { toast } from "@/components/common/Toast";
import { formatCurrency } from "@/lib/utils/format";

interface SubscriptionCheckoutFormProps {
  mentorId: string;
  planId: string;
  userId: string;
  amount: number; // in cents
  interval: "WEEKLY" | "MONTHLY" | "YEARLY";
  planName: string;
}

export default function SubscriptionCheckoutForm({
  mentorId,
  planId,
  userId,
  amount,
  interval,
  planName,
}: SubscriptionCheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const intervalLabel =
    interval === "WEEKLY" ? "week" : interval === "MONTHLY" ? "month" : "year";

  const handleSubscribe = async () => {
    if (!agreedToTerms) {
      toast("Please agree to the terms and conditions", "error");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          planId,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // Redirect to Stripe Checkout
      if (data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast(
        error instanceof Error ? error.message : "Failed to start subscription",
        "error"
      );
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="mb-6 text-xl font-semibold">Payment Details</h2>

        {/* Subscription Info */}
        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-white/70">Subscription Plan</span>
            <span className="font-semibold text-white">{planName}</span>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-white/70">Billing Frequency</span>
            <span className="font-semibold text-white">Every {intervalLabel}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-lg font-semibold text-white">Total Due Today</span>
            <span className="text-2xl font-bold text-white">{formatCurrency(amount)}</span>
          </div>
          <p className="mt-2 text-xs text-white/50">
            Then {formatCurrency(amount)} every {intervalLabel} until you cancel
          </p>
        </div>

        {/* Terms Agreement */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-sm text-white/70">
              I agree to be charged {formatCurrency(amount)} every {intervalLabel} until I
              cancel. I understand that I can cancel my subscription at any time from my
              dashboard, and I will retain access until the end of my current billing period.
            </span>
          </label>
        </div>

        {/* Subscribe Button */}
        <Button
          onClick={handleSubscribe}
          disabled={!agreedToTerms || isProcessing}
          variant="primary"
          className="w-full"
        >
          {isProcessing ? "Processing..." : `Subscribe for ${formatCurrency(amount)}/${intervalLabel}`}
        </Button>

        {/* Additional Info */}
        <div className="mt-6 space-y-2 text-xs text-white/50">
          <p>🔒 Secure payment processing by Stripe</p>
          <p>📧 You&apos;ll receive an email confirmation after subscribing</p>
          <p>🔄 Automatic renewal - cancel anytime from your dashboard</p>
          <p>
            💰 The mentor receives 85% of your payment (
            {formatCurrency(Math.round(amount * 0.85))}), BeMyMentor keeps 15% (
            {formatCurrency(Math.round(amount * 0.15))})
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
