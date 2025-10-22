"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import FormFieldError from "@/components/common/FormFieldError";
import { X, AlertTriangle } from "lucide-react";

interface CancelBookingModalProps {
  bookingId: string;
  bookingType: "ACCESS" | "SESSION";
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelBookingModal({
  bookingId,
  bookingType,
  onClose,
  onSuccess,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (reason.trim().length < 10) {
      setError("Please provide a cancellation reason (at least 10 characters)");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason.trim(),
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Failed to cancel booking");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Cancel error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Cancel Booking</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-white font-medium mb-1">
                Are you sure you want to cancel?
              </p>
              <p className="text-xs text-white/60">
                {bookingType === "ACCESS"
                  ? "Your ACCESS pass will be revoked, and a refund will be processed if applicable."
                  : "This session will be cancelled, and a refund will be processed if applicable."}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-white/80 mb-2">
              Cancellation Reason *
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please tell us why you're cancelling..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-white/40 mt-1">
              {reason.length}/500 characters (minimum 10)
            </p>
          </div>

          {error && <FormFieldError error={error} />}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Keep Booking
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={loading}
              className="flex-1"
            >
              Cancel Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
