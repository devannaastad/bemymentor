// app/api/mentors/[id]/available-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { format, parse, startOfDay, endOfDay, addMinutes, isAfter, isBefore } from "date-fns";

type Params = { id: string };

/**
 * GET /api/mentors/[id]/available-slots?date=YYYY-MM-DD&duration=60
 * Get available time slots for a mentor on a specific date
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id: mentorId } = await context.params;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD
    const durationParam = searchParams.get("duration") || "60"; // minutes

    if (!dateParam) {
      return NextResponse.json(
        { ok: false, error: "Missing 'date' parameter (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const duration = parseInt(durationParam, 10);
    if (isNaN(duration) || duration < 15 || duration > 240) {
      return NextResponse.json(
        { ok: false, error: "Duration must be between 15 and 240 minutes" },
        { status: 400 }
      );
    }

    // Get mentor's timezone first
    const mentor = await db.mentor.findUnique({
      where: { id: mentorId },
      select: { timezone: true },
    });

    const mentorTimezone = mentor?.timezone || "America/New_York";

    // Parse the requested date
    const requestedDate = parse(dateParam, "yyyy-MM-dd", new Date());

    // Get available slots for this specific date
    const dayStart = startOfDay(requestedDate);
    const dayEnd = endOfDay(requestedDate);

    const availableSlots = await db.availableSlot.findMany({
      where: {
        mentorId,
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (availableSlots.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          date: dateParam,
          slots: [],
          message: "Mentor has no availability on this day",
        },
      });
    }

    // Get blocked slots for this date
    const blockedSlots = await db.blockedSlot.findMany({
      where: {
        mentorId,
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
    });

    // Get existing bookings for this date
    const existingBookings = await db.booking.findMany({
      where: {
        mentorId,
        scheduledAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: { in: ["PENDING", "CONFIRMED"] }, // Don't block cancelled/completed
      },
      select: {
        scheduledAt: true,
        durationMinutes: true,
      },
    });

    // Generate available slots based on AvailableSlot records
    const slots: Array<{ time: string; isFreeSession: boolean; isPast?: boolean; isBooked?: boolean }> = [];

    for (const avail of availableSlots) {
      // Get the start and end times from the AvailableSlot DateTime fields
      let currentSlotStart = new Date(avail.startTime);
      const availEnd = new Date(avail.endTime);

      // Generate slots in 30-min increments (or duration if smaller)
      const increment = Math.min(duration, 30);

      while (isBefore(currentSlotStart, availEnd)) {
        const slotEndTime = addMinutes(currentSlotStart, duration);

        // Check if slot end time is within availability window
        if (isAfter(slotEndTime, availEnd)) {
          break;
        }

        // Check if slot overlaps with blocked time
        const isBlocked = blockedSlots.some((blocked) => {
          const blockedStart = new Date(blocked.startTime);
          const blockedEnd = new Date(blocked.endTime);
          return (
            (currentSlotStart >= blockedStart && currentSlotStart < blockedEnd) ||
            (slotEndTime > blockedStart && slotEndTime <= blockedEnd) ||
            (currentSlotStart <= blockedStart && slotEndTime >= blockedEnd)
          );
        });

        // Check if slot overlaps with existing booking (+ 30min buffer)
        const isBooked = existingBookings.some((booking) => {
          if (!booking.scheduledAt || !booking.durationMinutes) return false;
          const bookingStart = new Date(booking.scheduledAt);
          const bookingEnd = addMinutes(bookingStart, booking.durationMinutes);

          // Add 30-minute buffer after each booking
          const bufferEnd = addMinutes(bookingEnd, 30);

          // Check overlap with booking + buffer
          return (
            (currentSlotStart >= bookingStart && currentSlotStart < bufferEnd) ||
            (slotEndTime > bookingStart && slotEndTime <= bufferEnd) ||
            (currentSlotStart <= bookingStart && slotEndTime >= bufferEnd)
          );
        });

        // Check if slot is in the past (for same-day bookings)
        // Add 30-minute buffer to current time (in UTC)
        const now = new Date();
        const minimumStartTime = addMinutes(now, 30);
        const isPastTime = isBefore(currentSlotStart, minimumStartTime);

        // Debug logging
        if (dateParam === format(new Date(), "yyyy-MM-dd")) {
          console.log(`[available-slots DEBUG]`, {
            slotTime: format(currentSlotStart, "HH:mm"),
            slotTimeUTC: currentSlotStart.toISOString(),
            nowUTC: now.toISOString(),
            minimumStartTimeUTC: minimumStartTime.toISOString(),
            isPastTime,
            mentorTimezone,
          });
        }

        // Add slot if not blocked - include past times and booked times but mark them
        if (!isBlocked) {
          // Format time in mentor's timezone
          const timeInMentorTz = currentSlotStart.toLocaleTimeString("en-US", {
            timeZone: mentorTimezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          slots.push({
            time: timeInMentorTz,
            isFreeSession: avail.isFreeSession,
            isPast: isPastTime,
            isBooked: isBooked,
          });
        }

        currentSlotStart = addMinutes(currentSlotStart, increment);
      }
    }

    // Sort by time
    slots.sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      ok: true,
      data: {
        date: dateParam,
        duration,
        slots,
        timezone: mentorTimezone,
      },
    });
  } catch (err) {
    console.error("[api/mentors/[id]/available-slots] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
