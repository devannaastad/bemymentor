// app/api/mentor/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const settingsSchema = z.object({
  accessPrice: z.number().int().positive().nullable().optional(),
  hourlyRate: z.number().int().positive().nullable().optional(),
  offersFreeSession: z.boolean().optional(),
  freeSessionDuration: z.number().int().positive().nullable().optional(),
  freeSessionsRemaining: z.number().int().min(0).nullable().optional(),
  timezone: z.string().optional(),
});

/**
 * PATCH /api/mentor/settings
 * Update mentor settings (pricing, free sessions)
 */
export async function PATCH(req: NextRequest) {
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

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = settingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const {
      accessPrice,
      hourlyRate,
      offersFreeSession,
      freeSessionDuration,
      freeSessionsRemaining,
      timezone,
    } = validation.data;

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (accessPrice !== undefined) updateData.accessPrice = accessPrice;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (offersFreeSession !== undefined) updateData.offersFreeSession = offersFreeSession;
    if (freeSessionDuration !== undefined) updateData.freeSessionDuration = freeSessionDuration;
    if (freeSessionsRemaining !== undefined) updateData.freeSessionsRemaining = freeSessionsRemaining;
    if (timezone !== undefined) updateData.timezone = timezone;

    console.log("[mentor/settings] Received update data:", validation.data);
    console.log("[mentor/settings] Update payload:", updateData);

    // Update mentor profile
    const updatedMentor = await db.mentor.update({
      where: { id: user.mentorProfile.id },
      data: updateData,
    });

    console.log("[mentor/settings] Updated mentor settings:", {
      mentorId: updatedMentor.id,
      updates: Object.keys(updateData),
      newHourlyRate: updatedMentor.hourlyRate,
      newAccessPrice: updatedMentor.accessPrice,
    });

    // Revalidate catalog and mentor pages to show updated pricing
    revalidatePath("/catalog");
    revalidatePath(`/mentors/${updatedMentor.id}`);
    revalidatePath(`/book/${updatedMentor.id}`);

    return NextResponse.json(
      { ok: true, data: updatedMentor },
      { status: 200 }
    );
  } catch (err) {
    console.error("[mentor/settings] PATCH failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mentor/settings
 * Get current mentor settings
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

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, data: user.mentorProfile },
      { status: 200 }
    );
  } catch (err) {
    console.error("[mentor/settings] GET failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
