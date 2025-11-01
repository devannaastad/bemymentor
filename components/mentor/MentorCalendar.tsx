"use client";

import { useState, useEffect } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { Calendar, Clock, User, X, Plus, Edit, Trash2 } from "lucide-react";
import Button from "@/components/common/Button";

interface Booking {
  id: string;
  scheduledAt: Date;
  durationMinutes: number;
  user: {
    name: string | null;
    email: string | null;
  };
  type: string;
  status: string;
}

interface BlockedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  reason: string | null;
}

interface AvailableSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isFreeSession: boolean;
}

interface DayData {
  bookings: Booking[];
  blockedSlots: BlockedSlot[];
  availableSlots: AvailableSlot[];
  hasAvailability: boolean;
}

interface MentorCalendarProps {
  mentorId: string;
}

export default function MentorCalendar({ mentorId }: MentorCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Map<string, DayData>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailableSlot | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [availabilityTime, setAvailabilityTime] = useState({
    startTime: "09:00",
    endTime: "17:00",
  });
  const [isFreeSession, setIsFreeSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch calendar data for the current month
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const monthStr = format(currentMonth, "yyyy-MM");
        const res = await fetch(`/api/mentor/calendar?month=${monthStr}`);
        const data = await res.json();

        if (data.ok) {
          const dataMap = new Map<string, DayData>();

          // Process bookings
          data.data.bookings?.forEach((booking: Booking) => {
            const dateStr = format(new Date(booking.scheduledAt), "yyyy-MM-dd");
            if (!dataMap.has(dateStr)) {
              dataMap.set(dateStr, {
                bookings: [],
                blockedSlots: [],
                availableSlots: [],
                hasAvailability: false,
              });
            }
            dataMap.get(dateStr)!.bookings.push({
              ...booking,
              scheduledAt: new Date(booking.scheduledAt),
            });
          });

          // Process blocked slots
          data.data.blockedSlots?.forEach((slot: BlockedSlot) => {
            const dateStr = format(new Date(slot.startTime), "yyyy-MM-dd");
            if (!dataMap.has(dateStr)) {
              dataMap.set(dateStr, {
                bookings: [],
                blockedSlots: [],
                availableSlots: [],
                hasAvailability: false,
              });
            }
            dataMap.get(dateStr)!.blockedSlots.push({
              ...slot,
              startTime: new Date(slot.startTime),
              endTime: new Date(slot.endTime),
            });
          });

          // Process available slots (includes free session info)
          data.data.availableSlots?.forEach((slot: AvailableSlot) => {
            const dateStr = format(new Date(slot.startTime), "yyyy-MM-dd");
            if (!dataMap.has(dateStr)) {
              dataMap.set(dateStr, {
                bookings: [],
                blockedSlots: [],
                availableSlots: [],
                hasAvailability: true,
              });
            } else {
              dataMap.get(dateStr)!.hasAvailability = true;
            }
            dataMap.get(dateStr)!.availableSlots.push({
              ...slot,
              startTime: new Date(slot.startTime),
              endTime: new Date(slot.endTime),
            });
          });

          // Process availability dates
          data.data.availableDates?.forEach((dateStr: string) => {
            if (!dataMap.has(dateStr)) {
              dataMap.set(dateStr, {
                bookings: [],
                blockedSlots: [],
                availableSlots: [],
                hasAvailability: true,
              });
            } else {
              dataMap.get(dateStr)!.hasAvailability = true;
            }
          });

          setCalendarData(dataMap);
        }
      } catch (err) {
        console.error("Failed to fetch calendar data:", err);
      }
    };

    fetchCalendarData();
  }, [currentMonth, mentorId, refreshKey]);

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

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleBlockDate = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      // Block the entire day
      const startTime = new Date(selectedDate);
      startTime.setHours(0, 0, 0, 0);
      const endTime = new Date(selectedDate);
      endTime.setHours(23, 59, 59, 999);

      const res = await fetch("/api/mentor/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          reason: blockReason.trim() || undefined,
        }),
      });

      if (res.ok) {
        setShowBlockModal(false);
        setBlockReason("");
        // Trigger calendar data refresh
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to block date:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetAvailability = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      // Format the date as YYYY-MM-DD
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      // Get user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch("/api/mentor/available-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          startTime: availabilityTime.startTime,
          endTime: availabilityTime.endTime,
          isFreeSession,
          timezone,
        }),
      });

      if (res.ok) {
        setShowAvailabilityModal(false);
        setAvailabilityTime({ startTime: "09:00", endTime: "17:00" });
        setIsFreeSession(false);
        // Trigger calendar data refresh
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await res.json();
        console.error("Failed to set availability:", errorData);
        alert(errorData.error || "Failed to set availability");
      }
    } catch (err) {
      console.error("Failed to set availability:", err);
      alert("Failed to set availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlot = (slot: AvailableSlot) => {
    setEditingSlot(slot);
    setAvailabilityTime({
      startTime: format(slot.startTime, "HH:mm"),
      endTime: format(slot.endTime, "HH:mm"),
    });
    setIsFreeSession(slot.isFreeSession);
    setShowEditModal(true);
  };

  const handleUpdateAvailability = async () => {
    if (!editingSlot) return;

    setLoading(true);
    try {
      // Format the date as YYYY-MM-DD from the slot's startTime
      const dateStr = format(editingSlot.startTime, "yyyy-MM-dd");

      // Get user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch("/api/mentor/available-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          startTime: availabilityTime.startTime,
          endTime: availabilityTime.endTime,
          isFreeSession,
          timezone,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingSlot(null);
        setAvailabilityTime({ startTime: "09:00", endTime: "17:00" });
        setIsFreeSession(false);
        // Trigger calendar data refresh
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await res.json();
        console.error("Failed to update availability:", errorData);
        alert(errorData.error || "Failed to update availability");
      }
    } catch (err) {
      console.error("Failed to update availability:", err);
      alert("Failed to update availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvailability = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this availability slot?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/mentor/available-slots?id=${slotId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Trigger calendar data refresh
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await res.json();
        console.error("Failed to delete availability:", errorData);
        alert(errorData.error || "Failed to delete availability");
      }
    } catch (err) {
      console.error("Failed to delete availability:", err);
      alert("Failed to delete availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockDate = async (slotId: string) => {
    if (!confirm("Are you sure you want to unblock this date?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/mentor/blocked-slots?id=${slotId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Trigger calendar data refresh
        setRefreshKey(prev => prev + 1);
      } else {
        const errorData = await res.json();
        console.error("Failed to unblock date:", errorData);
        alert(errorData.error || "Failed to unblock date");
      }
    } catch (err) {
      console.error("Failed to unblock date:", err);
      alert("Failed to unblock date. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDayInfo = (date: Date): DayData | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    return calendarData.get(dateStr) || null;
  };

  return (
    <div className="space-y-6 relative">
      {/* Smooth gradient overlay to blend with background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/20 rounded-lg -z-10" />
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">My Calendar</h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-1.5 sm:p-2 hover:bg-white/10 transition-colors"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5"
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

          <h3 className="text-base sm:text-lg font-semibold text-white min-w-[140px] sm:min-w-[160px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h3>

          <button
            onClick={handleNextMonth}
            className="rounded-lg p-1.5 sm:p-2 hover:bg-white/10 transition-colors"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5"
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
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-white/60 bg-white/5 p-3 sm:p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-500/30 border-2 border-red-500"></div>
          <span>Blocked (Default)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500/30 border-2 border-green-500"></div>
          <span>Available for Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-emerald-500/30 border-2 border-emerald-500"></div>
          <span>Free Session Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500/30 border-2 border-blue-500"></div>
          <span>Has Bookings</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-b from-gray-900 to-gray-900/95 border border-white/20 rounded-xl p-3 sm:p-6 shadow-2xl backdrop-blur-sm">
            {/* Weekday Headers */}
            <div className="mb-2 grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[10px] sm:text-xs font-medium text-white/60">
              <div className="hidden sm:block">Sun</div>
              <div className="hidden sm:block">Mon</div>
              <div className="hidden sm:block">Tue</div>
              <div className="hidden sm:block">Wed</div>
              <div className="hidden sm:block">Thu</div>
              <div className="hidden sm:block">Fri</div>
              <div className="hidden sm:block">Sat</div>
              <div className="sm:hidden">S</div>
              <div className="sm:hidden">M</div>
              <div className="sm:hidden">T</div>
              <div className="sm:hidden">W</div>
              <div className="sm:hidden">T</div>
              <div className="sm:hidden">F</div>
              <div className="sm:hidden">S</div>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
              {days.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                const dayInfo = getDayInfo(day);

                const hasBookings = dayInfo && dayInfo.bookings.length > 0;
                const isBlocked = dayInfo && dayInfo.blockedSlots.length > 0;
                const hasAvailability = dayInfo && dayInfo.hasAvailability;
                const hasFreeSession = dayInfo && dayInfo.availableSlots.some(slot => slot.isFreeSession);

                // Determine color: Blue (bookings) > Emerald (free session) > Green (available) > Red (blocked/default)
                let dayColor = "bg-red-500/30 border-2 border-red-500"; // Default: blocked/unavailable

                if (hasAvailability && !isBlocked) {
                  dayColor = "bg-green-500/30 border-2 border-green-500"; // Available for booking
                }

                if (hasFreeSession && !isBlocked) {
                  dayColor = "bg-emerald-500/30 border-2 border-emerald-500"; // Free session available
                }

                if (hasBookings) {
                  dayColor = "bg-blue-500/30 border-2 border-blue-500"; // Has bookings
                }

                return (
                  <button
                    key={index}
                    onClick={() => !isPast && handleDateClick(day)}
                    disabled={isPast}
                    className={`
                      aspect-square rounded-md sm:rounded-lg p-1 sm:p-2 text-xs sm:text-sm font-medium transition-all relative
                      ${!isCurrentMonth ? "text-white/30 opacity-40" : "text-white"}
                      ${isSelected ? "ring-1 sm:ring-2 ring-primary-400 ring-offset-1 sm:ring-offset-2 ring-offset-gray-900" : ""}
                      ${isToday && !isSelected ? "ring-1 sm:ring-2 ring-white/40" : ""}
                      ${isPast ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:opacity-90"}
                      ${isCurrentMonth && !isPast ? dayColor : "bg-white/5 border border-sm:border-2 border-transparent"}
                    `}
                  >
                    <div className="text-[10px] sm:text-sm">{format(day, "d")}</div>
                    {hasBookings && (
                      <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2">
                        <div className="flex gap-0.5">
                          {dayInfo.bookings.slice(0, 3).map((_, i) => (
                            <div key={i} className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-blue-400" />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day Details Sidebar */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>

                {(() => {
                  const dayInfo = getDayInfo(selectedDate);

                  if (!dayInfo || !dayInfo.hasAvailability) {
                    // Day is blocked (no availability set for this day of week)
                    return (
                      <div className="space-y-3">
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm">
                          <p className="text-white/80 mb-1 font-medium">Blocked</p>
                          <p className="text-xs text-white/60">
                            This day is not available for bookings
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowAvailabilityModal(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Set Available
                        </Button>
                        {!dayInfo?.blockedSlots.length && (
                          <p className="text-xs text-white/40 text-center">
                            Set your availability for {format(selectedDate, "EEEE")}s to allow bookings
                          </p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {/* Bookings */}
                      {dayInfo.bookings.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-white/60 mb-3 uppercase">
                            Bookings ({dayInfo.bookings.length})
                          </h4>
                          <div className="space-y-3">
                            {dayInfo.bookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <User className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-white">
                                        {booking.user.name || "Anonymous"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-white/70">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                      {format(booking.scheduledAt, "h:mm a")} - {" "}
                                      {format(
                                        new Date(booking.scheduledAt.getTime() + booking.durationMinutes * 60000),
                                        "h:mm a"
                                      )}
                                    </span>
                                  </div>

                                  <div className="text-xs text-white/50">
                                    {booking.durationMinutes} minutes • {booking.type}
                                  </div>

                                  <div className="pt-2 border-t border-white/10 space-y-1">
                                    <p className="text-xs text-white/60 font-medium">Contact:</p>
                                    <p className="text-xs text-white/80 break-all">
                                      {booking.user.email || "No email provided"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Available Slots / Free Sessions */}
                      {dayInfo.availableSlots.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-white/60 mb-3 uppercase">
                            Available Time Slots
                          </h4>
                          <div className="space-y-2">
                            {dayInfo.availableSlots.map((slot) => (
                              <div
                                key={slot.id}
                                className={`p-3 rounded-lg text-sm ${
                                  slot.isFreeSession
                                    ? "bg-emerald-500/10 border border-emerald-500/30"
                                    : "bg-green-500/10 border border-green-500/30"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-white/80">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                      {format(slot.startTime, "h:mm a")} -{" "}
                                      {format(slot.endTime, "h:mm a")}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditSlot(slot)}
                                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                                      title="Edit availability"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-white/60 hover:text-white" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAvailability(slot.id)}
                                      className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                                      title="Delete availability"
                                      disabled={loading}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-400/60 hover:text-red-400" />
                                    </button>
                                  </div>
                                </div>
                                {slot.isFreeSession && (
                                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                                    <span>🎁 Free Session</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Blocked Slots */}
                      {dayInfo.blockedSlots.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-white/60 mb-3 uppercase">
                            Blocked
                          </h4>
                          <div className="space-y-2">
                            {dayInfo.blockedSlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-white/80 flex-1">
                                    {slot.reason || "Unavailable"}
                                  </p>
                                  <button
                                    onClick={() => handleUnblockDate(slot.id)}
                                    className="p-1.5 hover:bg-white/10 rounded transition-colors shrink-0"
                                    title="Unblock this date"
                                    disabled={loading}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400/60 hover:text-red-400" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {dayInfo.blockedSlots.length === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBlockModal(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Block This Date
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center text-white/60">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-white/40" />
              <p>Select a date to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Set Availability Modal */}
      {showAvailabilityModal && selectedDate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Set Availability</h2>
              <button
                onClick={() => {
                  setShowAvailabilityModal(false);
                  setAvailabilityTime({ startTime: "09:00", endTime: "17:00" });
                  setIsFreeSession(false);
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-white/80 mb-2">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-sm text-white/60 mb-4">
                This will set availability for all {format(selectedDate, "EEEE")}s going forward.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={availabilityTime.startTime}
                  onChange={(e) =>
                    setAvailabilityTime({ ...availabilityTime, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={availabilityTime.endTime}
                  onChange={(e) =>
                    setAvailabilityTime({ ...availabilityTime, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>

              <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFreeSession}
                    onChange={(e) => setIsFreeSession(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-white font-medium block">Mark as Free Session</span>
                    <span className="text-xs text-white/60">Offer this time slot as a free intro session</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAvailabilityModal(false);
                  setAvailabilityTime({ startTime: "09:00", endTime: "17:00" });
                  setIsFreeSession(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSetAvailability}
                loading={loading}
                className="flex-1"
              >
                Set Available
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block Date Modal */}
      {showBlockModal && selectedDate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Block Date</h2>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason("");
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-white/80 mb-2">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-sm text-white/60">
                This will block the entire day and prevent new bookings.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., On vacation, Personal appointment..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none"
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleBlockDate}
                loading={loading}
                className="flex-1"
              >
                Block Date
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Availability Modal */}
      {showEditModal && editingSlot && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Availability</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSlot(null);
                  setAvailabilityTime({ startTime: "09:00", endTime: "17:00" });
                  setIsFreeSession(false);
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-white/80 mb-2">
                {format(editingSlot.startTime, "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-sm text-white/60 mb-4">
                Update your availability for this date.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={availabilityTime.startTime}
                  onChange={(e) =>
                    setAvailabilityTime({ ...availabilityTime, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={availabilityTime.endTime}
                  onChange={(e) =>
                    setAvailabilityTime({ ...availabilityTime, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>

              <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFreeSession}
                    onChange={(e) => setIsFreeSession(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-white font-medium block">Mark as Free Session</span>
                    <span className="text-xs text-white/60">Offer this time slot as a free intro session</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSlot(null);
                  setAvailabilityTime({ startTime: "09:00", endTime: "17:00" });
                  setIsFreeSession(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleUpdateAvailability}
                loading={loading}
                className="flex-1"
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
