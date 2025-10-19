// components/booking/BookingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import SessionTimePicker from "./SessionTimePicker";
import type { Mentor } from "@prisma/client";

interface BookingFormProps {
  mentor: Pick<Mentor, "id" | "name" | "offerType" | "accessPrice" | "hourlyRate">;
}

export default function BookingForm({ mentor }: BookingFormProps) {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<"ACCESS" | "SESSION">(
    mentor.offerType === "ACCESS" ? "ACCESS" : "SESSION"
  );
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTimeSelect = (datetime: string, duration: number) => {
    setScheduledAt(datetime);
    setDurationMinutes(duration);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        mentorId: mentor.id,
        type: bookingType,
        notes: notes.trim() || undefined,
        };

      if (bookingType === "SESSION") {
        if (!scheduledAt) {
          setError("Please select a date and time for your session");
          setIsSubmitting(false);
          return;
        }
        payload.scheduledAt = scheduledAt;
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

      // Redirect to booking confirmation
      router.push(`/bookings/${body.data.id}/confirm`);
    } catch (err) {
      console.error("[BookingForm] Submit failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
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
                  ? "border-emerald-500/50 bg-emerald-500/10"
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
                  ? "border-blue-500/50 bg-blue-500/10"
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

      {/* Session Time Picker (only for SESSION type) */}
      {bookingType === "SESSION" && mentor.hourlyRate && (
        <SessionTimePicker onTimeSelect={handleTimeSelect} hourlyRate={mentor.hourlyRate} />
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

      {/* Submit Button */}
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
        <div>
          <p className="text-center text-xs text-white/50">
            Payment processing is currently in development. Bookings will be created but not charged.
            </p>
          <p className="text-2xl font-bold">
            {bookingType === "ACCESS"
              ? `$${mentor.accessPrice}`
              : `$${Math.round(((mentor.hourlyRate || 0) / 60) * durationMinutes)}`}
          </p>
        </div>
        <Button type="submit" disabled={isSubmitting} variant="primary" size="lg">
          {isSubmitting ? "Processing..." : "Continue to Payment"}
        </Button>
      </div>

      <p className="text-center text-xs text-white/50">
        Payment processing is currently in development. Bookings will be created but not charged.
      </p>
    </form>
  );
}