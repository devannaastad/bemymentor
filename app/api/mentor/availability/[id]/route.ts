// app/api/mentor/availability/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { id: string };

const updateAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/mentor/availability/[id]
 * Update availability slot
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
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

    const { id } = await context.params;
    const body = await req.json();
    const validation = updateAvailabilitySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await db.availability.findUnique({
      where: { id },
    });

    if (!existing || existing.mentorId !== user.mentorProfile.id) {
      return NextResponse.json(
        { ok: false, error: "Availability slot not found" },
        { status: 404 }
      );
    }

    const updated = await db.availability.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({ ok: true, data: updated }, { status: 200 });
  } catch (err) {
    console.error("[api/mentor/availability/[id]] PATCH failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/mentor/availability/[id]
 * Delete availability slot
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
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

    const { id } = await context.params;

    // Verify ownership
    const existing = await db.availability.findUnique({
      where: { id },
    });

    if (!existing || existing.mentorId !== user.mentorProfile.id) {
      return NextResponse.json(
        { ok: false, error: "Availability slot not found" },
        { status: 404 }
      );
    }

    await db.availability.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, message: "Availability slot deleted" }, { status: 200 });
  } catch (err) {
    console.error("[api/mentor/availability/[id]] DELETE failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
