"use client";

import { useState } from "react";
import CalendarPicker from "./CalendarPicker";
import TimeSlotSelector from "./TimeSlotSelector";
import { addDays } from "date-fns";

interface SessionSchedulerProps {
  mentorId: string;
  onSchedule: (scheduledAt: Date, duration: number) => void;
  hourlyRate: number;
}

export default function SessionScheduler({
  mentorId,
  onSchedule,
  hourlyRate,
}: SessionSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(60);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    // Don't automatically proceed to payment - user must click "Continue to Payment" button
  };

  const handleContinueToPayment = () => {
    if (selectedDate && selectedTime) {
      // Combine date and time into a full datetime
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      onSchedule(scheduledDateTime, duration);
    }
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setSelectedTime(null); // Reset time when duration changes (affects available slots)
  };

  // Calculate price based on hourly rate and duration
  const calculatePrice = () => {
    return Math.round((hourlyRate / 60) * duration);
  };

  const minDate = addDays(new Date(), 1); // Tomorrow
  const maxDate = addDays(new Date(), 90); // 90 days from now

  return (
    <div className="grid gap-6">
      {/* Duration Selector */}
      <div>
        <label className="mb-3 block text-sm font-medium text-white/90">
          Session Duration
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[30, 60, 90, 120].map((dur) => {
            const price = Math.round((hourlyRate / 60) * dur);
            return (
              <button
                key={dur}
                type="button"
                onClick={() => handleDurationChange(dur)}
                className={`
                  rounded-lg border p-3 text-left transition
                  ${
                    duration === dur
                      ? "border-purple-500 bg-purple-600/20 ring-2 ring-purple-400"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }
                `}
              >
                <div className="text-sm font-semibold">{dur} min</div>
                <div className="text-xs text-white/60">${price}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Picker */}
      <div>
        <label className="mb-3 block text-sm font-medium text-white/90">
          Select a Date
        </label>
        <CalendarPicker
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          minDate={minDate}
          maxDate={maxDate}
          mentorId={mentorId}
          showAvailability={true}
        />
      </div>

      {/* Time Slot Selector - Only show after date is selected */}
      {selectedDate && (
        <div>
          <TimeSlotSelector
            mentorId={mentorId}
            selectedDate={selectedDate}
            duration={duration}
            selectedTime={selectedTime}
            onSelectTime={handleTimeSelect}
          />
        </div>
      )}

      {/* Confirmation Summary - Only show when both date and time selected */}
      {selectedDate && selectedTime && (
        <div className="space-y-4">
          <div className="rounded-lg border border-primary-500/30 bg-primary-500/10 p-4">
            <h4 className="mb-3 font-semibold text-white text-lg">
              Session Details
            </h4>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex justify-between">
                <span className="text-white/60">Date:</span>
                <span className="font-medium">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Duration:</span>
                <span className="font-medium">{duration} minutes</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-white/60">Total Price:</span>
                <span className="font-bold text-primary-400 text-lg">
                  ${calculatePrice()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinueToPayment}
            className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-400 text-black font-semibold rounded-lg hover:scale-[1.02] transition-transform shadow-lg"
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  );
}
