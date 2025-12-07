"use client";

import { useState } from "react";
import CalendarPicker from "./CalendarPicker";
import TimeSlotSelector from "./TimeSlotSelector";
import { addDays } from "date-fns";
import { getUserTimezone, getTimezoneAbbreviation } from "@/lib/utils/timezone";

interface SessionSchedulerProps {
  mentorId: string;
  onSchedule: (scheduledAt: Date, duration: number, isFreeSession: boolean) => void;
  hourlyRate: number;
}

export default function SessionScheduler({
  mentorId,
  onSchedule,
  hourlyRate,
}: SessionSchedulerProps) {
  // Calculate if 30 minutes would be below minimum ($0.50 = 50 cents)
  const thirtyMinPriceInCents = Math.round((hourlyRate / 60) * 30);
  const is30MinBelowMinimum = thirtyMinPriceInCents < 50;

  // Default to 60 minutes if 30 minutes is below minimum
  const defaultDuration = is30MinBelowMinimum ? 60 : 30;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedIsFreeSession, setSelectedIsFreeSession] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(defaultDuration);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
    setSelectedIsFreeSession(false);
  };

  const handleTimeSelect = (time: string, isFreeSession: boolean, utcDatetime: Date) => {
    setSelectedTime(time);
    setSelectedIsFreeSession(isFreeSession);

    // Pass the UTC datetime directly to parent
    onSchedule(utcDatetime, duration, isFreeSession);
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setSelectedTime(null); // Reset time when duration changes (affects available slots)
  };

  // Calculate price based on hourly rate and duration
  // hourlyRate is in cents, so divide by 100 to get dollars
  const calculatePrice = () => {
    return ((hourlyRate / 100) / 60 * duration).toFixed(2);
  };

  const minDate = new Date(); // Today (same-day bookings allowed)
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
            // hourlyRate is in cents, convert to dollars
            const price = ((hourlyRate / 100) / 60 * dur).toFixed(2);
            const priceInCents = Math.round((hourlyRate / 60) * dur);

            // Disable 30min if it would be below Stripe's $0.50 minimum
            const isBelowMinimum = priceInCents < 50;
            const isDisabled = dur === 30 && isBelowMinimum;

            return (
              <button
                key={dur}
                type="button"
                onClick={() => !isDisabled && handleDurationChange(dur)}
                disabled={isDisabled}
                className={`
                  rounded-lg border p-3 text-left transition relative
                  ${
                    isDisabled
                      ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                      : duration === dur
                      ? "border-purple-500 bg-purple-600/20 ring-2 ring-purple-400"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }
                `}
                title={isDisabled ? "Minimum booking price is $0.50" : undefined}
              >
                <div className={`text-sm font-semibold ${isDisabled ? 'line-through' : ''}`}>
                  {dur} min
                </div>
                <div className="text-xs text-white/60">${price}</div>
                {isDisabled && (
                  <div className="text-xs text-red-400 mt-1">Below minimum</div>
                )}
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
        <div className="rounded-lg border border-primary-500/50 bg-gradient-to-br from-primary-500/20 to-primary-600/10 p-5 shadow-lg">
          <h4 className="mb-4 font-semibold text-white text-lg flex items-center gap-2">
            <span className="text-2xl">✓</span>
            Selected Session
          </h4>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Date:</span>
              <span className="font-semibold text-white">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Time:</span>
              <span className="font-semibold text-white">
                {selectedTime} <span className="text-primary-300 ml-1">{getTimezoneAbbreviation(getUserTimezone())}</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Duration:</span>
              <span className="font-semibold text-white">{duration} minutes</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/20">
              <span className="text-white/70">Total Price:</span>
              <span className="font-bold text-primary-300 text-xl">
                {selectedIsFreeSession ? "FREE" : `$${calculatePrice()}`}
              </span>
            </div>
          </div>
          {selectedIsFreeSession && (
            <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
              <p className="text-sm text-emerald-200 font-semibold">
                🎉 Free Introductory Session
              </p>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/60 text-center">
              🌍 Times shown in your timezone ({getTimezoneAbbreviation(getUserTimezone())})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
