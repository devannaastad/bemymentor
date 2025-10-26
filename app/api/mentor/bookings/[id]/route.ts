// app/api/mentor/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { processBookingPayout } from "@/lib/payout-processor";
import { z } from "zod";

export const runtime = "nodejs";

const updateSchema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED"]),
  cancellationReason: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
});

/**
 * PATCH /api/mentor/bookings/[id]
 * Update booking status (mentor only)
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Not a mentor" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { status, cancellationReason, meetingLink } = validation.data;

    // Verify this booking belongs to this mentor
    const booking = await db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.mentorId !== user.mentorProfile.id) {
      return NextResponse.json(
        { ok: false, error: "Not authorized to update this booking" },
        { status: 403 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
      REFUNDED: [],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Cannot transition from ${booking.status} to ${status}`,
        },
        { status: 400 }
      );
    }

    // Update booking
    const updated = await db.booking.update({
      where: { id },
      data: {
        status,
        cancellationReason:
          status === "CANCELLED" ? cancellationReason || "Cancelled by mentor" : undefined,
        meetingLink: meetingLink || undefined,
      },
      include: {
        mentor: true,
      },
    });

    // Process payout if marking as COMPLETED (for SESSION bookings)
    if (status === "COMPLETED") {
      try {
        const payoutResult = await processBookingPayout(updated.id);

        if (payoutResult?.status === "HELD" && "releaseDate" in payoutResult) {
          console.log(`[mentor/bookings/[id]] Payout HELD until ${payoutResult.releaseDate}: ${payoutResult.reason}`);
        } else if (payoutResult?.status === "PAID_OUT" && "transferId" in payoutResult) {
          console.log(`[mentor/bookings/[id]] Payout PAID_OUT immediately (trusted mentor): ${payoutResult.transferId}`);
        }
      } catch (payoutError) {
        console.error("[mentor/bookings/[id]] Failed to process payout:", payoutError);
        // Don't fail the booking update, payout can be retried
      }
    }

    return NextResponse.json(
      { ok: true, data: updated },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/mentor/bookings/[id]] PATCH failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * GET /api/mentor/bookings/[id]
 * Get single booking details (mentor only)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Not a mentor" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const booking = await db.booking.findUnique({
      where: { id },
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
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.mentorId !== user.mentorProfile.id) {
      return NextResponse.json(
        { ok: false, error: "Not authorized to view this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { ok: true, data: booking },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/mentor/bookings/[id]] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}