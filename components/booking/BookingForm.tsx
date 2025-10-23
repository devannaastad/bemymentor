// components/booking/BookingForm.tsx
"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import Modal from "@/components/common/Modal";
import SessionScheduler from "./SessionScheduler";
import type { Mentor } from "@prisma/client";

interface BookingFormProps {
  mentor: Pick<Mentor, "id" | "name" | "offerType" | "accessPrice" | "hourlyRate">;
}

export default function BookingForm({ mentor }: BookingFormProps) {
  const [bookingType, setBookingType] = useState<"ACCESS" | "SESSION">(
    mentor.offerType === "ACCESS" ? "ACCESS" : "SESSION"
  );
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSchedule = (datetime: Date, duration: number) => {
    setScheduledAt(datetime);
    setDurationMinutes(duration);
  };

  const calculatePrice = () => {
    if (bookingType === "ACCESS") {
      return mentor.accessPrice || 0;
    }
    return Math.round(((mentor.hourlyRate || 0) / 60) * durationMinutes);
  };

  const handleContinueClick = () => {
    // Validate session booking
    if (bookingType === "SESSION" && !scheduledAt) {
      setError("Please select a date and time for your session");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
    setError(null);
  };

  const handleConfirmBooking = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        mentorId: mentor.id,
        type: bookingType,
        notes: notes.trim() || undefined,
      };

      if (bookingType === "SESSION") {
        payload.scheduledAt = scheduledAt!.toISOString();
        payload.durationMinutes = durationMinutes;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Failed to create booking");
      }

      // Create Stripe checkout session and redirect directly
      const checkoutRes = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: body.data.id }),
      });

      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) {
        console.error("[BookingForm] Checkout session error:", checkoutData);
        throw new Error(checkoutData.error || "Failed to create checkout session");
      }

      if (!checkoutData.data?.url) {
        console.error("[BookingForm] No checkout URL returned:", checkoutData);
        throw new Error("No checkout URL received from server");
      }

      // Redirect to Stripe
      console.log("[BookingForm] Redirecting to Stripe:", checkoutData.data.url);
      window.location.href = checkoutData.data.url;
    } catch (err) {
      console.error("[BookingForm] Submit failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid gap-6">
        {/* Booking Type Selection (if mentor offers BOTH) */}
        {mentor.offerType === "BOTH" && (
          <div>
            <label className="mb-3 block text-sm font-medium text-white/90">
              What would you like to book?
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setBookingType("ACCESS")}
                className={`rounded-lg border p-4 text-left transition ${
                  bookingType === "ACCESS"
                    ? "border-emerald-500/50 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <h3 className="mb-1 font-semibold">ACCESS Pass</h3>
                <p className="mb-2 text-2xl font-bold">${mentor.accessPrice}</p>
                <p className="text-sm text-white/60">One-time payment for full access</p>
              </button>

              <button
                type="button"
                onClick={() => setBookingType("SESSION")}
                className={`rounded-lg border p-4 text-left transition ${
                  bookingType === "SESSION"
                    ? "border-blue-500/50 bg-blue-500/10 ring-2 ring-blue-500/30"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <h3 className="mb-1 font-semibold">1-on-1 Session</h3>
                <p className="mb-2 text-2xl font-bold">${mentor.hourlyRate}/hr</p>
                <p className="text-sm text-white/60">Live coaching session</p>
              </button>
            </div>
          </div>
        )}

        {/* Session Scheduler (only for SESSION type) */}
        {bookingType === "SESSION" && mentor.hourlyRate && (
          <SessionScheduler
            mentorId={mentor.id}
            onSchedule={handleSchedule}
            hourlyRate={mentor.hourlyRate}
          />
        )}

        {/* ACCESS Summary */}
        {bookingType === "ACCESS" && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <h3 className="mb-2 font-semibold text-emerald-200">ACCESS Pass</h3>
            <p className="mb-3 text-sm text-emerald-100/70">
              Get instant access to all digital resources, community, and exclusive content.
            </p>
            <p className="text-2xl font-bold text-emerald-200">${mentor.accessPrice}</p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="mb-2 block text-sm font-medium text-white/90">
            Notes for {mentor.name} (Optional)
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any specific topics or questions you'd like to cover..."
            maxLength={500}
          />
          <p className="mt-1 text-xs text-white/50">{notes.length}/500 characters</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Prominent Continue Button */}
        <Button
          onClick={handleContinueClick}
          disabled={isSubmitting || (bookingType === "SESSION" && !scheduledAt)}
          variant="primary"
          size="lg"
          className="w-full py-4 text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-xl shadow-primary-500/20"
        >
          {isSubmitting ? "Processing..." : `Continue to Payment - $${calculatePrice()}`}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <h3 className="text-xl font-bold text-white mb-4">Confirm Your Booking</h3>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-white/70">Mentor:</span>
            <span className="font-semibold text-white">{mentor.name}</span>
          </div>

          {bookingType === "SESSION" && scheduledAt && (
            <>
              <div className="flex justify-between">
                <span className="text-white/70">Date:</span>
                <span className="font-semibold text-white">
                  {scheduledAt.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Time:</span>
                <span className="font-semibold text-white">
                  {scheduledAt.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Duration:</span>
                <span className="font-semibold text-white">{durationMinutes} minutes</span>
              </div>
            </>
          )}

          {bookingType === "ACCESS" && (
            <div className="flex justify-between">
              <span className="text-white/70">Type:</span>
              <span className="font-semibold text-white">ACCESS Pass</span>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-white/20">
            <span className="text-white/70">Total:</span>
            <span className="font-bold text-primary-300 text-2xl">${calculatePrice()}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowConfirmModal(false)}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBooking}
            variant="primary"
            className="flex-1 bg-gradient-to-r from-primary-400 to-primary-500"
          >
            Confirm & Pay
          </Button>
        </div>
      </Modal>
    </>
  );
}
