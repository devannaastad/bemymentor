// app/api/mentor/calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { mentorProfile: true },
    });

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const mentorId = user.mentorProfile.id;

    // Get month parameter (format: YYYY-MM)
    const monthParam = req.nextUrl.searchParams.get("month");
    let monthDate: Date;

    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      monthDate = new Date(year, month - 1, 1); // month is 0-indexed
    } else {
      monthDate = new Date();
    }

    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    // Extend to end of last day to include all times
    monthEnd.setHours(23, 59, 59, 999);

    // Fetch bookings for this month
    const bookings = await db.booking.findMany({
      where: {
        mentorId,
        type: "SESSION",
        status: {
          in: ["CONFIRMED", "PENDING"],
        },
        scheduledAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

    // Fetch blocked slots for this month
    const blockedSlots = await db.blockedSlot.findMany({
      where: {
        mentorId,
        startTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Fetch available slots for this month
    const availableSlots = await db.availableSlot.findMany({
      where: {
        mentorId,
        startTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Get mentor's timezone from user profile
    const mentorTimezone = user.timezone || "America/New_York";

    // Generate available dates based on available slots
    // Format dates in the MENTOR'S timezone (not UTC)
    const availableDates: string[] = [];
    const availableDateSet = new Set<string>();

    availableSlots.forEach((slot) => {
      // Convert UTC time to mentor's timezone before formatting
      const slotInMentorTz = toZonedTime(new Date(slot.startTime), mentorTimezone);
      const dateStr = format(slotInMentorTz, "yyyy-MM-dd");

      // Check if this day is blocked
      const isBlocked = blockedSlots.some((blocked) => {
        const blockedInMentorTz = toZonedTime(new Date(blocked.startTime), mentorTimezone);
        return (
          blockedInMentorTz.getFullYear() === slotInMentorTz.getFullYear() &&
          blockedInMentorTz.getMonth() === slotInMentorTz.getMonth() &&
          blockedInMentorTz.getDate() === slotInMentorTz.getDate()
        );
      });

      // If not blocked and not already added, add to available dates
      if (!isBlocked && !availableDateSet.has(dateStr)) {
        availableDateSet.add(dateStr);
        availableDates.push(dateStr);
      }
    });

    return NextResponse.json({
      ok: true,
      data: {
        bookings,
        blockedSlots,
        availableDates,
        availableSlots, // Include full slot data with isFreeSession flag
      },
    });
  } catch (error) {
    console.error("Get mentor calendar error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
