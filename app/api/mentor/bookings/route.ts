// app/api/mentor/bookings/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/mentor/bookings
 * Get all bookings for the current mentor
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
        { ok: false, error: "Not a mentor" },
        { status: 403 }
      );
    }

    const bookings = await db.booking.findMany({
      where: { mentorId: user.mentorProfile.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDING first
        { scheduledAt: "asc" }, // Then by scheduled time
        { createdAt: "desc" }, // Then by creation time
      ],
    });

    return NextResponse.json(
      { ok: true, data: bookings },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/mentor/bookings] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}