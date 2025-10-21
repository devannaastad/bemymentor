// components/booking/PaymentButton.tsx
"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";

interface PaymentButtonProps {
  bookingId: string;
}

export default function PaymentButton({ bookingId }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const res = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.data.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("[PaymentButton] Error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handlePayment}
        disabled={loading}
        variant="primary"
        className="w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span>Processing...</span>
          </>
        ) : (
          "Complete Payment"
        )}
      </Button>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-200">
          {error}
        </div>
      )}

      <p className="text-center text-xs text-white/50">
        Secure payment powered by Stripe
      </p>
    </div>
  );
}
