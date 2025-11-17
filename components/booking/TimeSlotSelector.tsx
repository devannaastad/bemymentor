"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getTimezoneAbbreviation, getUserTimezone } from "@/lib/utils/timezone";

interface TimeSlotSelectorProps {
  mentorId: string;
  selectedDate: Date;
  duration: number; // in minutes
  selectedTime: string | null;
  onSelectTime: (time: string, isFreeSession: boolean) => void;
}

interface TimeSlot {
  time: string;
  isFreeSession: boolean;
  isPast?: boolean;
  isBooked?: boolean;
}

interface AvailableSlotsResponse {
  ok: boolean;
  data?: {
    date: string;
    duration: number;
    slots: TimeSlot[];
    timezone: string;
  };
  error?: string;
}

export default function TimeSlotSelector({
  mentorId,
  selectedDate,
  duration,
  selectedTime,
  onSelectTime,
}: TimeSlotSelectorProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(
          `/api/mentors/${mentorId}/available-slots?date=${dateStr}&duration=${duration}`
        );

        const data: AvailableSlotsResponse = await res.json();

        if (!data.ok) {
          setError(data.error || "Failed to load available slots");
          setSlots([]);
          return;
        }

        if (data.data) {
          setSlots(data.data.slots);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setError("Failed to load available times");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [mentorId, selectedDate, duration]);

  const formatTimeDisplay = (time: string) => {
    // Convert "09:00" to "9:00 AM"
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-center text-rose-200">
        {error}
      </div>
    );
  }

  // Filter to check if there are any available (not past, not booked) slots
  const availableSlots = slots.filter((slot) => !slot.isPast && !slot.isBooked);

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6 text-center">
        <div className="mb-2 text-3xl">📅</div>
        <h3 className="mb-1 font-semibold text-amber-200">No Available Times</h3>
        <p className="text-sm text-white/70">
          This mentor has no availability on {format(selectedDate, "MMMM d, yyyy")}.
          Try selecting a different date.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">
          Available Times ({format(selectedDate, "MMM d, yyyy")})
        </h3>
        <span className="text-xs text-white/60">{getTimezoneAbbreviation(getUserTimezone())}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isDisabled = slot.isPast || slot.isBooked;

          return (
            <button
              key={slot.time}
              onClick={() => !isDisabled && onSelectTime(slot.time, slot.isFreeSession)}
              disabled={isDisabled}
              className={`
                rounded-lg border px-4 py-3 text-sm font-medium transition-all relative
                ${
                  isDisabled
                    ? "border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
                    : isSelected
                    ? slot.isFreeSession
                      ? "border-pink-500 bg-pink-600 text-white ring-2 ring-pink-400"
                      : "border-purple-500 bg-purple-600 text-white ring-2 ring-purple-400"
                    : slot.isFreeSession
                    ? "border-pink-500/30 bg-pink-500/10 hover:border-pink-500/50 hover:bg-pink-500/20"
                    : "border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10"
                }
              `}
            >
              <div className={isDisabled ? "line-through" : ""}>
                {formatTimeDisplay(slot.time)}
              </div>
              {slot.isFreeSession && !isDisabled && (
                <div className="text-xs mt-1 font-semibold text-pink-300">
                  FREE
                </div>
              )}
              {slot.isPast && (
                <div className="text-xs mt-1 text-white/40">
                  Past
                </div>
              )}
              {slot.isBooked && (
                <div className="text-xs mt-1 text-white/40">
                  Booked
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-200">
        <strong>Session Duration:</strong> {duration} minutes
      </div>

      {availableSlots.length === 0 && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center text-sm text-amber-200">
          All time slots for this date are either past or already booked. Please select a different date.
        </div>
      )}
    </div>
  );
}
