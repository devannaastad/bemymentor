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

    // Parse month and get all dates in that month
    const monthDate = new Date(`${monthParam}-01`);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get mentor's availability patterns
    const availability = await db.availability.findMany({
      where: {
        mentorId,
        isActive: true,
      },
      select: {
        dayOfWeek: true,
      },
    });

    if (availability.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          month: monthParam,
          availableDates: [],
          message: "Mentor has no availability set",
        },
      });
    }

    // Get unique days of week mentor is available
    const availableDaysOfWeek = new Set(availability.map((a) => a.dayOfWeek));

    // Check which dates match available days of week
    const availableDates: string[] = [];

    for (const date of daysInMonth) {
      const dayOfWeek = date.getDay(); // 0 = Sunday

      if (availableDaysOfWeek.has(dayOfWeek)) {
        availableDates.push(format(date, "yyyy-MM-dd"));
      }
    }

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
