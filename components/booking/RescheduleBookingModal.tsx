"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import FormFieldError from "@/components/common/FormFieldError";
import { X, Calendar } from "lucide-react";

interface RescheduleBookingModalProps {
  bookingId: string;
  currentDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RescheduleBookingModal({
  bookingId,
  currentDate,
  onClose,
  onSuccess,
}: RescheduleBookingModalProps) {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!newDate || !newTime) {
        setError("Please select a new date and time");
        setLoading(false);
        return;
      }

      // Combine date and time into ISO string
      const newScheduledAt = new Date(`${newDate}T${newTime}`).toISOString();

      const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newScheduledAt,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Failed to reschedule booking");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Reschedule error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  // Format current date for display
  const currentDateStr = new Date(currentDate).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Reschedule Booking</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-primary-400 mt-0.5" />
            <div>
              <p className="text-xs text-white/60 mb-1">Current date:</p>
              <p className="text-sm text-white">{currentDateStr}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newDate" className="block text-sm font-medium text-white/80 mb-2">
              New Date *
            </label>
            <input
              id="newDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="newTime" className="block text-sm font-medium text-white/80 mb-2">
              New Time *
            </label>
            <input
              id="newTime"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-white/80 mb-2">
              Reason (Optional)
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you rescheduling?"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-white/40 mt-1">{reason.length}/500 characters</p>
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
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              Reschedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
