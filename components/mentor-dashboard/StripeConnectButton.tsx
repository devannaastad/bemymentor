"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { CreditCard } from "lucide-react";
import { toast } from "@/components/common/Toast";
import type { Mentor } from "@prisma/client";

interface StripeConnectButtonProps {
  mentor: Mentor;
}

export default function StripeConnectButton({ mentor }: StripeConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectStripe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/mentor/stripe-connect", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to connect Stripe");
      }

      // Redirect to Stripe onboarding or dashboard
      if (data.data.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      console.error("Stripe Connect error:", error);
      toast(
        error instanceof Error ? error.message : "Failed to connect Stripe account",
        "error"
      );
      setIsLoading(false);
    }
  };

  // Show different button text based on Stripe status
  const buttonText = mentor.stripeOnboarded
    ? "Stripe Dashboard"
    : mentor.stripeConnectId
    ? "Complete Stripe Setup"
    : "Connect Stripe";

  const buttonVariant = mentor.stripeOnboarded ? "ghost" : "primary";

  return (
    <Button
      onClick={handleConnectStripe}
      disabled={isLoading}
      variant={buttonVariant}
      className="flex items-center gap-2"
    >
      <CreditCard className="h-4 w-4" />
      {isLoading ? "Loading..." : buttonText}
    </Button>
  );
}
