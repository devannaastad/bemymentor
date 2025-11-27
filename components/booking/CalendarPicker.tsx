"use client";

import { useState, useEffect } from "react";
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, isAfter, isBefore, startOfDay } from "date-fns";

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  minDate?: Date; // Don't allow dates before this
  maxDate?: Date; // Don't allow dates after this
  disabledDates?: Date[]; // Specific dates to disable
  mentorId?: string; // For fetching availability calendar
  showAvailability?: boolean; // Show color-coded availability
}

export default function CalendarPicker({
  selectedDate,
  onSelectDate,
  minDate = new Date(), // Default to today
  maxDate,
  disabledDates = [],
  mentorId,
  showAvailability = false,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [freeDates, setFreeDates] = useState<Set<string>>(new Set());

  // Fetch availability calendar when month changes
  useEffect(() => {
    if (!showAvailability || !mentorId) return;

    const fetchAvailability = async () => {
      try {
        const monthStr = format(currentMonth, "yyyy-MM");
        // Get user's timezone to show availability in their local time
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch(`/api/mentors/${mentorId}/availability-calendar?month=${monthStr}&timezone=${encodeURIComponent(userTimezone)}`);
        const data = await res.json();

        if (data.ok && data.data?.availableDates) {
          setAvailableDates(new Set(data.data.availableDates));
          setFreeDates(new Set(data.data.freeDates || []));
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      }
    };

    fetchAvailability();
  }, [currentMonth, mentorId, showAvailability]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (isBefore(day, calendarEnd) || isSameDay(day, calendarEnd)) {
    days.push(day);
    day = addDays(day, 1);
  }

  const isDateDisabled = (date: Date) => {
    const dateStart = startOfDay(date);

    // Before min date
    if (isBefore(dateStart, startOfDay(minDate))) {
      return true;
    }

    // After max date
    if (maxDate && isAfter(dateStart, startOfDay(maxDate))) {
      return true;
    }

    // In disabled dates list
    if (disabledDates.some((d) => isSameDay(dateStart, startOfDay(d)))) {
      return true;
    }

    return false;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onSelectDate(date);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="rounded-lg p-2 hover:bg-white/10 transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={handleNextMonth}
          className="rounded-lg p-2 hover:bg-white/10 transition-colors"
          aria-label="Next month"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-white/60">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDisabled = isDateDisabled(day);
          const isToday = isSameDay(day, new Date());
          const dateStr = format(day, "yyyy-MM-dd");
          const hasAvailability = availableDates.has(dateStr);
          const hasFreeSession = freeDates.has(dateStr);

          // Determine availability styling
          let availabilityClass = "";
          let borderClass = "";

          if (showAvailability && isCurrentMonth && !isDisabled) {
            if (hasAvailability) {
              if (hasFreeSession) {
                // Free session - pink background/border
                availabilityClass = isSelected
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "bg-pink-500/20 hover:bg-pink-500/30";
                borderClass = "ring-2 ring-pink-500/50";
              } else {
                // Available day - green background/border
                availabilityClass = isSelected
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-500/20 hover:bg-green-500/30";
                borderClass = "ring-2 ring-green-500/50";
              }
            } else {
              // Unavailable day - red background/border
              availabilityClass = "bg-red-500/20";
              borderClass = "ring-2 ring-red-500/50";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={`
                aspect-square rounded-lg p-2 text-sm font-medium transition-all relative
                ${!isCurrentMonth ? "text-white/30" : ""}
                ${!showAvailability && isSelected ? "bg-purple-600 text-white ring-2 ring-purple-400" : ""}
                ${!showAvailability && !isSelected && !isDisabled && isCurrentMonth ? "hover:bg-white/10" : ""}
                ${isDisabled ? "cursor-not-allowed text-white/20" : "cursor-pointer"}
                ${isToday && !isSelected ? "ring-1 ring-blue-400" : ""}
                ${availabilityClass}
                ${borderClass}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full ring-1 ring-blue-400"></div>
          <span>Today</span>
        </div>
        {showAvailability ? (
          <>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-green-500 bg-green-500/20"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-pink-500 bg-pink-500/20"></div>
              <span>Free Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border-2 border-red-500 bg-red-500/20"></div>
              <span>Unavailable</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-600"></div>
            <span>Selected</span>
          </div>
        )}
      </div>
    </div>
  );
}
