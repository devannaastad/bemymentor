"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Select from "@/components/common/Select";

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
}

interface BlockedSlot {
  id: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function AvailabilitySettings() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add new availability form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "America/New_York",
  });

  // Block date form state
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockDate, setBlockDate] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "17:00",
    reason: "",
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mentor/availability");
      const data = await res.json();

      if (data.ok) {
        setAvailability(data.data?.availability || []);
        setBlockedSlots(data.data?.blockedSlots || []);
      } else {
        setError(data.error || "Failed to fetch availability");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/mentor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess("Availability slot added!");
        setShowAddForm(false);
        setNewSlot({
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "17:00",
          timezone: "America/New_York",
        });
        fetchAvailability();
      } else {
        setError(data.error || "Failed to add slot");
      }
    } catch {
      setError("Network error");
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Delete this availability slot?")) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/mentor/availability/${slotId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess("Slot deleted");
        fetchAvailability();
      } else {
        setError(data.error || "Failed to delete");
      }
    } catch {
      setError("Network error");
    }
  };

  const handleToggleSlot = async (slotId: string, currentActive: boolean) => {
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/mentor/availability/${slotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess(currentActive ? "Slot disabled" : "Slot enabled");
        fetchAvailability();
      } else {
        setError(data.error || "Failed to update");
      }
    } catch {
      setError("Network error");
    }
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Combine date and time
      const startDateTime = new Date(`${blockDate.date}T${blockDate.startTime}`);
      const endDateTime = new Date(`${blockDate.date}T${blockDate.endTime}`);

      const res = await fetch("/api/mentor/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          reason: blockDate.reason,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess("Date blocked successfully!");
        setShowBlockForm(false);
        setBlockDate({
          date: format(new Date(), "yyyy-MM-dd"),
          startTime: "09:00",
          endTime: "17:00",
          reason: "",
        });
        fetchAvailability();
      } else {
        setError(data.error || "Failed to block date");
      }
    } catch {
      setError("Network error");
    }
  };

  const handleDeleteBlockedSlot = async (slotId: string) => {
    if (!confirm("Remove this blocked date?")) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/mentor/blocked-slots/${slotId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess("Blocked date removed");
        fetchAvailability();
      } else {
        setError(data.error || "Failed to remove");
      }
    } catch {
      setError("Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Availability Settings</h2>
        <p className="mt-1 text-sm text-white/60">
          Manage your weekly schedule and block specific dates
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {success}
        </div>
      )}

      {/* Weekly Availability */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Weekly Schedule</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
          >
            {showAddForm ? "Cancel" : "+ Add Time Slot"}
          </button>
        </div>

        {/* Add Slot Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSlot}
            className="mb-6 rounded-lg border border-purple-500/20 bg-purple-500/10 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Day of Week
                </label>
                <Select
                  value={newSlot.dayOfWeek}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, dayOfWeek: Number(e.target.value) })
                  }
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Timezone
                </label>
                <Select
                  value={newSlot.timezone}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, timezone: e.target.value })
                  }
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  End Time
                </label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, endTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700"
            >
              Add Availability Slot
            </button>
          </form>
        )}

        {/* Availability List */}
        {availability.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/60">
              No availability set. Add your first time slot to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {availability
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    slot.isActive
                      ? "border-white/10 bg-white/5"
                      : "border-white/5 bg-white/5 opacity-50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {DAYS_OF_WEEK.find((d) => d.value === slot.dayOfWeek)?.label}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      {slot.startTime} - {slot.endTime} ({slot.timezone})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSlot(slot.id, slot.isActive)}
                      className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                        slot.isActive
                          ? "bg-emerald-600/20 text-emerald-200 hover:bg-emerald-600/30"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {slot.isActive ? "Active" : "Disabled"}
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="rounded-lg bg-red-600/20 px-3 py-1 text-sm font-medium text-red-200 transition hover:bg-red-600/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Blocked Dates */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Blocked Dates</h3>
          <button
            onClick={() => setShowBlockForm(!showBlockForm)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            {showBlockForm ? "Cancel" : "+ Block a Date"}
          </button>
        </div>

        {/* Block Date Form */}
        {showBlockForm && (
          <form
            onSubmit={handleBlockDate}
            className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Date
                </label>
                <input
                  type="date"
                  value={blockDate.date}
                  onChange={(e) =>
                    setBlockDate({ ...blockDate, date: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={blockDate.reason}
                  onChange={(e) =>
                    setBlockDate({ ...blockDate, reason: e.target.value })
                  }
                  placeholder="e.g., Vacation, Holiday"
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Start Time
                </label>
                <input
                  type="time"
                  value={blockDate.startTime}
                  onChange={(e) =>
                    setBlockDate({ ...blockDate, startTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  End Time
                </label>
                <input
                  type="time"
                  value={blockDate.endTime}
                  onChange={(e) =>
                    setBlockDate({ ...blockDate, endTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
            >
              Block This Date
            </button>
          </form>
        )}

        {/* Blocked Slots List */}
        {blockedSlots.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/60">No blocked dates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedSlots
              .sort(
                (a, b) =>
                  new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
              )
              .map((slot) => {
                const start = new Date(slot.startTime);
                const end = new Date(slot.endTime);
                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {format(start, "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {format(start, "h:mm a")} - {format(end, "h:mm a")}
                        {slot.reason && ` • ${slot.reason}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBlockedSlot(slot.id)}
                      className="rounded-lg bg-red-600/20 px-3 py-1 text-sm font-medium text-red-200 transition hover:bg-red-600/30"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
