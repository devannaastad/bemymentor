"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import FormFieldError from "@/components/common/FormFieldError";
import { OfferType } from "@prisma/client";
import { DollarSign } from "lucide-react";

interface Step3PricingProps {
  initialData?: {
    offerType?: OfferType;
    accessPrice?: number;
    hourlyRate?: number;
  };
  onNext: (data: {
    offerType: OfferType;
    accessPrice?: number;
    hourlyRate?: number;
  }) => void;
  onBack: () => void;
}

export default function Step3Pricing({
  initialData,
  onNext,
  onBack,
}: Step3PricingProps) {
  const [offerType, setOfferType] = useState<OfferType | "">(
    initialData?.offerType || ""
  );
  const [accessPrice, setAccessPrice] = useState(
    initialData?.accessPrice ? (initialData.accessPrice / 100).toString() : ""
  );
  const [hourlyRate, setHourlyRate] = useState(
    initialData?.hourlyRate ? (initialData.hourlyRate / 100).toString() : ""
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!offerType) {
      setError("Please select an offer type");
      return;
    }

    // Validate pricing based on offer type (Stripe requires minimum $0.50)
    if (offerType === "ACCESS" || offerType === "BOTH") {
      if (!accessPrice || parseFloat(accessPrice) < 0.50) {
        setError("ACCESS pass price must be at least $0.50 (Stripe requirement)");
        return;
      }
    }

    if (offerType === "TIME" || offerType === "BOTH") {
      if (!hourlyRate || parseFloat(hourlyRate) < 0.50) {
        setError("Hourly rate must be at least $0.50 (Stripe requirement)");
        return;
      }
    }

    onNext({
      offerType: offerType as OfferType,
      accessPrice:
        offerType === "ACCESS" || offerType === "BOTH"
          ? Math.round(parseFloat(accessPrice) * 100)
          : undefined,
      hourlyRate:
        offerType === "TIME" || offerType === "BOTH"
          ? Math.round(parseFloat(hourlyRate) * 100)
          : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Pricing & Offers</h2>
        <p className="text-white/60">
          Choose what you want to offer and set your prices.
        </p>
      </div>

      <div className="space-y-6">
        {/* Offer Type Selection */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            What do you want to offer? *
          </label>
          <div className="space-y-3">
            {/* ACCESS Only */}
            <button
              type="button"
              onClick={() => setOfferType("ACCESS")}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                offerType === "ACCESS"
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
            >
              <div className="font-semibold text-white mb-1">ACCESS Pass Only</div>
              <p className="text-sm text-white/60">
                Students get ongoing access to your community, content, or group sessions
              </p>
            </button>

            {/* TIME Only */}
            <button
              type="button"
              onClick={() => setOfferType("TIME")}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                offerType === "TIME"
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
            >
              <div className="font-semibold text-white mb-1">1-on-1 Sessions Only</div>
              <p className="text-sm text-white/60">
                Book private, scheduled sessions with students at your hourly rate
              </p>
            </button>

            {/* BOTH */}
            <button
              type="button"
              onClick={() => setOfferType("BOTH")}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                offerType === "BOTH"
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
            >
              <div className="font-semibold text-white mb-1">Both OPTIONS</div>
              <p className="text-sm text-white/60">
                Offer both ACCESS passes and 1-on-1 sessions
              </p>
            </button>
          </div>
        </div>

        {/* Pricing Inputs */}
        {offerType && (
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            {(offerType === "ACCESS" || offerType === "BOTH") && (
              <div>
                <label htmlFor="accessPrice" className="block text-sm font-medium text-white/80 mb-2">
                  ACCESS Pass Price (USD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-white/40" />
                  </div>
                  <Input
                    id="accessPrice"
                    type="number"
                    step="0.01"
                    min="0.50"
                    value={accessPrice}
                    onChange={(e) => setAccessPrice(e.target.value)}
                    placeholder="49.99"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-white/40 mt-1">
                  One-time payment for ongoing access (minimum $0.50)
                </p>
              </div>
            )}

            {(offerType === "TIME" || offerType === "BOTH") && (
              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-white/80 mb-2">
                  Hourly Rate (USD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-white/40" />
                  </div>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0.50"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="99.99"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-white/40 mt-1">
                  Price per hour for 1-on-1 sessions (minimum $0.50)
                </p>
              </div>
            )}
          </div>
        )}

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
