"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Calendar, Plus, Trash2 } from "lucide-react";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

import { Mentor } from "@prisma/client";

interface AvailabilityEditorProps {
  mentor: Mentor;
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

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      times.push(timeStr);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export default function AvailabilityEditor({ mentor }: AvailabilityEditorProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing availability on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch(`/api/mentor/availability?mentorId=${mentor.id}`);
        if (response.ok) {
          const data = await response.json();
          setSlots(data.availability || []);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [mentor.id]);

  // Group slots by day
  const slotsByDay: Record<number, AvailabilitySlot[]> = {};
  slots.forEach((slot) => {
    if (!slotsByDay[slot.dayOfWeek]) {
      slotsByDay[slot.dayOfWeek] = [];
    }
    slotsByDay[slot.dayOfWeek].push(slot);
  });

  const addSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    };
    setSlots([...slots, newSlot]);
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string | number | boolean) => {
    const updatedSlots = [...slots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setSlots(updatedSlots);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-white/60">Loading availability...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Availability Schedule</h3>
          <p className="mt-1 text-sm text-white/60">
            Set your weekly availability for student bookings. Add multiple time slots per day.
          </p>
        </div>

        <div className="space-y-6">
          {DAYS_OF_WEEK.map((day, dayIndex) => {
            const daySlots = slotsByDay[dayIndex] || [];
            const hasSlots = daySlots.length > 0;

            return (
              <div key={dayIndex} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold text-white">{day}</h4>
                  <Button
                    onClick={() => addSlot(dayIndex)}
                    size="sm"
                    variant="ghost"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Slot
                  </Button>
                </div>

                {!hasSlots ? (
                  <p className="text-center text-sm text-white/40 py-4">
                    No availability set for this day
                  </p>
                ) : (
                  <div className="space-y-3">
                    {slots.map((slot, slotIndex) => {
                      if (slot.dayOfWeek !== dayIndex) return null;

                      return (
                        <div
                          key={slotIndex}
                          className="flex items-center gap-3 rounded-lg bg-white/5 p-3"
                        >
                          {/* Start Time */}
                          <div className="flex-1">
                            <label className="mb-1 block text-xs text-white/60">
                              Start Time
                            </label>
                            <select
                              value={slot.startTime}
                              onChange={(e) =>
                                updateSlot(slotIndex, "startTime", e.target.value)
                              }
                              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                              {TIME_OPTIONS.map((time) => (
                                <option key={time} value={time}>
                                  {formatTime(time)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* End Time */}
                          <div className="flex-1">
                            <label className="mb-1 block text-xs text-white/60">
                              End Time
                            </label>
                            <select
                              value={slot.endTime}
                              onChange={(e) =>
                                updateSlot(slotIndex, "endTime", e.target.value)
                              }
                              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                              {TIME_OPTIONS.map((time) => (
                                <option key={time} value={time}>
                                  {formatTime(time)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Active Toggle */}
                          <div className="flex items-center">
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={slot.isActive}
                                onChange={(e) =>
                                  updateSlot(slotIndex, "isActive", e.target.checked)
                                }
                                className="h-4 w-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                              />
                              <span className="text-xs text-white/60">Active</span>
                            </label>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeSlot(slotIndex)}
                            className="rounded-md p-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove time slot"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {slots.length === 0 && (
          <div className="mt-6 rounded-lg border-2 border-dashed border-white/10 p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-white/40" />
            <p className="mt-4 text-white/60">No availability set yet</p>
            <p className="mt-2 text-sm text-white/40">
              Click &quot;Add Slot&quot; on any day to start setting your schedule
            </p>
          </div>
        )}

        <div className="mt-6 rounded-lg bg-purple-500/10 p-4 text-sm text-white/70">
          <strong className="text-white">💡 Tip:</strong> Set your regular weekly availability here.
          You can block specific dates or times using the calendar in your dashboard.
        </div>
      </CardContent>
    </Card>
  );
}
