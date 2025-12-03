// app/api/mentors/[id]/availability-calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

type Params = { id: string };

/**
 * GET /api/mentors/[id]/availability-calendar?month=YYYY-MM
 * Get which dates in a month have availability (for color coding calendar)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id: mentorId } = await context.params;
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // YYYY-MM

    if (!monthParam) {
      return NextResponse.json(
        { ok: false, error: "Missing 'month' parameter (YYYY-MM)" },
        { status: 400 }
      );
    }

    // Get the mentor's timezone from their profile
    const mentor = await db.mentor.findUnique({
      where: { id: mentorId },
      select: { timezone: true },
    });

    if (!mentor) {
      return NextResponse.json(
        { ok: false, error: "Mentor not found" },
        { status: 404 }
      );
    }

    // Use mentor's timezone to display availability in their local time
    const mentorTimezone = mentor.timezone;

    // Parse month - fix timezone issues like in mentor calendar
    const [year, month] = monthParam.split("-").map(Number);
    const monthDate = new Date(year, month - 1, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    monthEnd.setHours(23, 59, 59, 999);

    // Get mentor's available slots for this month
    const availableSlots = await db.availableSlot.findMany({
      where: {
        mentorId,
        startTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        startTime: true,
        endTime: true,
        isFreeSession: true,
      },
    });

    if (availableSlots.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          month: monthParam,
          availableDates: [],
          freeDates: [],
          message: "Mentor has no availability set",
        },
      });
    }

    // Extract unique dates from available slots
    // Convert to MENTOR'S timezone to show availability on the correct days they set
    const availableDatesSet = new Set<string>();
    const freeDatesSet = new Set<string>();

    for (const slot of availableSlots) {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      // Convert both start and end to mentor's timezone (same timezone they used when creating slots)
      const startInMentorTz = toZonedTime(slotStart, mentorTimezone);
      const endInMentorTz = toZonedTime(slotEnd, mentorTimezone);

      // Get the date strings in mentor's timezone
      const startDateStr = format(startInMentorTz, "yyyy-MM-dd");
      const endDateStr = format(endInMentorTz, "yyyy-MM-dd");

      // Add both dates (they might be different if slot crosses midnight in mentor's TZ)
      availableDatesSet.add(startDateStr);
      if (startDateStr !== endDateStr) {
        availableDatesSet.add(endDateStr);
      }

      // Mark free session dates
      if (slot.isFreeSession) {
        freeDatesSet.add(startDateStr);
        if (startDateStr !== endDateStr) {
          freeDatesSet.add(endDateStr);
        }
      }
    }

    const availableDates = Array.from(availableDatesSet).sort();
    const freeDates = Array.from(freeDatesSet).sort();

    return NextResponse.json({
      ok: true,
      data: {
        month: monthParam,
        availableDates,
        freeDates,
        totalDays: availableDates.length,
      },
    });
  } catch (err) {
    console.error("[api/mentors/[id]/availability-calendar] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
