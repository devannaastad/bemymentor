// app/api/mentors/[id]/availability-calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

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
      },
    });

    if (availableSlots.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          month: monthParam,
          availableDates: [],
          message: "Mentor has no availability set",
        },
      });
    }

    // Extract unique dates from available slots
    const availableDatesSet = new Set<string>();
    for (const slot of availableSlots) {
      const dateStr = format(new Date(slot.startTime), "yyyy-MM-dd");
      availableDatesSet.add(dateStr);
    }

    const availableDates = Array.from(availableDatesSet).sort();

    return NextResponse.json({
      ok: true,
      data: {
        month: monthParam,
        availableDates,
        totalDays: availableDates.length,
      },
    });
  } catch (err) {
    console.error("[api/mentors/[id]/availability-calendar] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
