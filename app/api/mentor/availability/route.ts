// app/api/mentor/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  timezone: z.string().default("America/New_York"),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/mentor/availability
 * Get mentor's availability schedule
 */
export async function GET() {
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

    const availability = await db.availability.findMany({
      where: { mentorId: user.mentorProfile.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ ok: true, data: availability }, { status: 200 });
  } catch (err) {
    console.error("[api/mentor/availability] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/mentor/availability
 * Add new availability slot
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
    const validation = availabilitySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { dayOfWeek, startTime, endTime, timezone, isActive } = validation.data;

    // Validate end time is after start time
    if (endTime <= startTime) {
      return NextResponse.json(
        { ok: false, error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const availability = await db.availability.create({
      data: {
        mentorId: user.mentorProfile.id,
        dayOfWeek,
        startTime,
        endTime,
        timezone,
        isActive,
      },
    });

    return NextResponse.json({ ok: true, data: availability }, { status: 201 });
  } catch (err) {
    console.error("[api/mentor/availability] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
