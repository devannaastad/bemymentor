// app/api/mentor/calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, format } from "date-fns";

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

    // Generate available dates based on available slots
    const availableDates: string[] = [];
    const availableDateSet = new Set<string>();

    availableSlots.forEach((slot) => {
      const dateStr = format(new Date(slot.startTime), "yyyy-MM-dd");

      // Check if this day is blocked
      const isBlocked = blockedSlots.some((blocked) => {
        const blockedDate = new Date(blocked.startTime);
        const slotDate = new Date(slot.startTime);
        return (
          blockedDate.getFullYear() === slotDate.getFullYear() &&
          blockedDate.getMonth() === slotDate.getMonth() &&
          blockedDate.getDate() === slotDate.getDate()
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
