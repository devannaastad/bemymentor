// app/api/mentor/blocked-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const BlockedSlotSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.string().optional(),
});

/**
 * POST /api/mentor/blocked-slots
 * Create a new blocked slot (specific date/time range that's unavailable)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { mentorProfile: true },
    });

    if (!user?.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Not a mentor" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = BlockedSlotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data" },
        { status: 400 }
      );
    }

    const { startTime, endTime, reason } = parsed.data;

    // Validate end > start
    if (new Date(endTime) <= new Date(startTime)) {
      return NextResponse.json(
        { ok: false, error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const blockedSlot = await db.blockedSlot.create({
      data: {
        mentorId: user.mentorProfile.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        reason: reason || null,
      },
    });

    return NextResponse.json({
      ok: true,
      data: { blockedSlot },
      message: "Blocked slot created",
    });
  } catch (err) {
    console.error("[api/mentor/blocked-slots] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
