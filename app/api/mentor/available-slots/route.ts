// app/api/mentor/available-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const availableSlotSchema = z.object({
  date: z.string(), // YYYY-MM-DD format
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

/**
 * POST /api/mentor/available-slots
 * Set availability for a specific date
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { mentorProfile: true },
    });

    if (!user?.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = availableSlotSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { date, startTime, endTime } = validation.data;

    // Validate end time is after start time
    if (endTime <= startTime) {
      return NextResponse.json(
        { ok: false, error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Parse the date and create DateTime objects
    const [year, month, day] = date.split("-").map(Number);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
    const endDateTime = new Date(year, month - 1, day, endHour, endMinute);

    // Check if there's already an available slot for this date (any time)
    const existingForDate = await db.availableSlot.findFirst({
      where: {
        mentorId: user.mentorProfile.id,
        startTime: {
          gte: new Date(year, month - 1, day, 0, 0, 0),
          lt: new Date(year, month - 1, day + 1, 0, 0, 0),
        },
      },
    });

    if (existingForDate) {
      // Delete existing slot and create new one (update pattern)
      await db.availableSlot.delete({
        where: { id: existingForDate.id },
      });
    }

    // Create the available slot
    const availableSlot = await db.availableSlot.create({
      data: {
        mentorId: user.mentorProfile.id,
        startTime: startDateTime,
        endTime: endDateTime,
      },
    });

    console.log("[available-slots] Created slot:", availableSlot);

    return NextResponse.json({ ok: true, data: availableSlot }, { status: 201 });
  } catch (err) {
    console.error("[api/mentor/available-slots] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
