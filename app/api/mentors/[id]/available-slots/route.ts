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
    const slots: string[] = [];

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

        // Check if slot overlaps with existing booking
        const isBooked = existingBookings.some((booking) => {
          if (!booking.scheduledAt || !booking.durationMinutes) return false;
          const bookingStart = new Date(booking.scheduledAt);
          const bookingEnd = addMinutes(bookingStart, booking.durationMinutes);
          return (
            (currentSlotStart >= bookingStart && currentSlotStart < bookingEnd) ||
            (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
            (currentSlotStart <= bookingStart && slotEndTime >= bookingEnd)
          );
        });

        // Only add if not blocked and not booked
        if (!isBlocked && !isBooked) {
          slots.push(format(currentSlotStart, "HH:mm"));
        }

        currentSlotStart = addMinutes(currentSlotStart, increment);
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        date: dateParam,
        duration,
        slots: slots.sort(), // Sort chronologically
        timezone: "America/New_York", // TODO: Make timezone configurable per mentor
      },
    });
  } catch (err) {
    console.error("[api/mentors/[id]/available-slots] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
