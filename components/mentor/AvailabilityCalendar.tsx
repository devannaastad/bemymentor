"use client";

import { Card, CardContent } from "@/components/common/Card";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";

interface AvailableSlot {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

interface AvailabilityCalendarProps {
  mentorId: string;
  availableSlots: AvailableSlot[];
  timezone: string;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_ABBREV = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityCalendar({
  availableSlots,
  timezone,
}: AvailabilityCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Group slots by day of week
  const slotsByDay: Record<number, AvailableSlot[]> = {};
  availableSlots.forEach((slot) => {
    if (!slotsByDay[slot.dayOfWeek]) {
      slotsByDay[slot.dayOfWeek] = [];
    }
    slotsByDay[slot.dayOfWeek].push(slot);
  });

  // Format time for display (converts "09:00" to "9:00 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const hasAvailability = Object.keys(slotsByDay).length > 0;

  if (!hasAvailability) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-semibold">Availability</h2>
          </div>
          <p className="text-white/60 text-sm">
            This mentor has not set their availability yet. Please contact them directly to schedule a session.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-semibold">Availability</h2>
          </div>
          <span className="text-sm text-white/60">{timezone}</span>
        </div>

        {/* Day selector */}
        <div className="mb-4 grid grid-cols-7 gap-2">
          {DAY_ABBREV.map((day, index) => {
            const isAvailable = !!slotsByDay[index];
            const isSelected = selectedDay === index;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : index)}
                disabled={!isAvailable}
                className={`
                  rounded-lg p-2 text-center text-sm font-medium transition-all
                  ${isAvailable
                    ? isSelected
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Time slots display */}
        {selectedDay !== null && slotsByDay[selectedDay] ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/80 mb-2">
              {DAYS_OF_WEEK[selectedDay]} Time Slots
            </h3>
            {slotsByDay[selectedDay].map((slot) => (
              <div
                key={slot.id}
                className="flex items-center gap-2 rounded-lg bg-white/5 p-3 border border-white/10"
              >
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-white">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white/5 p-4 text-center">
            <p className="text-sm text-white/60">
              {Object.keys(slotsByDay).length > 0
                ? "Select a day above to see available time slots"
                : "No availability set"}
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-white/50">
          Book a session to reserve one of these time slots with this mentor.
        </p>
      </CardContent>
    </Card>
  );
}
