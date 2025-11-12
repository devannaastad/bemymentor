// components/booking/SessionTimePicker.tsx
"use client";

import { useState } from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";

interface SessionTimePickerProps {
  onTimeSelect: (date: string, duration: number) => void;
  hourlyRate: number;
}

export default function SessionTimePicker({ onTimeSelect, hourlyRate }: SessionTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(60);

  // Generate available times (9 AM - 5 PM)
  const availableTimes = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // Calculate minimum date (today - same-day bookings allowed)
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  // Calculate price
  const sessionPrice = Math.round((hourlyRate / 60) * duration);

  const handleUpdate = (newDate?: string, newTime?: string, newDuration?: number) => {
    const date = newDate ?? selectedDate;
    const time = newTime ?? selectedTime;
    const dur = newDuration ?? duration;

    if (date && time) {
      const datetime = `${date}T${time}:00.000Z`;
      onTimeSelect(datetime, dur);
    }

    if (newDate !== undefined) setSelectedDate(newDate);
    if (newTime !== undefined) setSelectedTime(newTime);
    if (newDuration !== undefined) setDuration(newDuration);
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Date Picker */}
        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-white/90">
            Select Date
          </label>
          <Input
            id="date"
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e) => handleUpdate(e.target.value, undefined, undefined)}
            required
          />
        </div>

        {/* Time Picker */}
        <div>
          <label htmlFor="time" className="mb-2 block text-sm font-medium text-white/90">
            Select Time (UTC)
          </label>
          <Select
            id="time"
            value={selectedTime}
            onChange={(e) => handleUpdate(undefined, e.target.value, undefined)}
            required
          >
            <option value="">Choose a time</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Duration Picker */}
      <div>
        <label htmlFor="duration" className="mb-2 block text-sm font-medium text-white/90">
          Session Duration
        </label>
        <Select
          id="duration"
          value={duration}
          onChange={(e) => handleUpdate(undefined, undefined, Number(e.target.value))}
          required
        >
          <option value={30}>30 minutes - ${Math.round((hourlyRate / 60) * 30)}</option>
          <option value={60}>60 minutes - ${Math.round((hourlyRate / 60) * 60)}</option>
          <option value={90}>90 minutes - ${Math.round((hourlyRate / 60) * 90)}</option>
          <option value={120}>120 minutes - ${Math.round((hourlyRate / 60) * 120)}</option>
        </Select>
      </div>

      {/* Price Summary */}
      {selectedDate && selectedTime && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-200">
            <strong>Total:</strong> ${sessionPrice} for {duration} minutes
          </p>
          <p className="mt-1 text-xs text-blue-200/70">
            Scheduled for {selectedDate} at {selectedTime} UTC
          </p>
        </div>
      )}
    </div>
  );
}