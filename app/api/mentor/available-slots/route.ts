// app/api/mentor/available-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";

const availableSlotSchema = z.object({
  date: z.string(), // YYYY-MM-DD format
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  isFreeSession: z.boolean().default(false),
  timezone: z.string().optional(), // User's timezone (e.g., "America/Los_Angeles")
});

/**
 * DELETE /api/mentor/available-slots
 * Delete an availability slot
 */
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = req.nextUrl;
    const slotId = searchParams.get("id");

    if (!slotId) {
      return NextResponse.json(
        { ok: false, error: "Slot ID is required" },
        { status: 400 }
      );
    }

    // Verify the slot belongs to this mentor
    const slot = await db.availableSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      return NextResponse.json(
        { ok: false, error: "Slot not found" },
        { status: 404 }
      );
    }

    if (slot.mentorId !== user.mentorProfile.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized to delete this slot" },
        { status: 403 }
      );
    }

    // Delete the slot
    await db.availableSlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[api/mentor/available-slots] DELETE failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

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

    const { date, startTime, endTime, isFreeSession, timezone } = validation.data;

    // Validate end time is after start time
    if (endTime <= startTime) {
      return NextResponse.json(
        { ok: false, error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Parse the date and create DateTime objects
    // Use the user's timezone to create the correct UTC timestamp
    const userTimezone = timezone || "America/Los_Angeles"; // Default to Pacific if not provided

    // Parse date components
    const [year, month, day] = date.split("-").map(Number);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Create Date objects in the user's timezone, then convert to UTC for storage
    // fromZonedTime interprets the date as being in the specified timezone
    const startDateTime = fromZonedTime(
      new Date(year, month - 1, day, startHour, startMinute, 0),
      userTimezone
    );
    const endDateTime = fromZonedTime(
      new Date(year, month - 1, day, endHour, endMinute, 0),
      userTimezone
    );

    // Check if there's already an available slot for this date (any time)
    const dayStart = fromZonedTime(new Date(year, month - 1, day, 0, 0, 0), userTimezone);
    const dayEnd = fromZonedTime(new Date(year, month - 1, day, 23, 59, 59), userTimezone);

    const existingForDate = await db.availableSlot.findFirst({
      where: {
        mentorId: user.mentorProfile.id,
        startTime: {
          gte: dayStart,
          lte: dayEnd,
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
        isFreeSession,
      },
    });

    return NextResponse.json({ ok: true, data: availableSlot }, { status: 201 });
  } catch (err) {
    console.error("[api/mentor/available-slots] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
