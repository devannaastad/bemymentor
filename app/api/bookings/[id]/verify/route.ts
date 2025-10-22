// app/api/bookings/[id]/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type Params = { id: string };

/**
 * POST /api/bookings/[id]/verify
 * Customer verifies booking was legitimate (no scam)
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { id: bookingId } = await context.params;

    // Get booking with mentor info
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        mentor: {
          select: {
            id: true,
            verifiedBookingsCount: true,
            isTrusted: true,
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

    // Verify ownership
    if (booking.userId !== user.id) {
      return NextResponse.json(
        { ok: false, error: "You can only verify your own bookings" },
        { status: 403 }
      );
    }

    // Check if already verified
    if (booking.isVerified) {
      return NextResponse.json(
        { ok: false, error: "Booking already verified" },
        { status: 400 }
      );
    }

    // Check if fraud was reported
    if (booking.isFraudReported) {
      return NextResponse.json(
        { ok: false, error: "Cannot verify booking marked as fraud" },
        { status: 400 }
      );
    }

    // Only allow verification for completed bookings
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { ok: false, error: "Only completed bookings can be verified" },
        { status: 400 }
      );
    }

    // Update booking as verified
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Increment mentor's verified bookings count
    const newVerifiedCount = booking.mentor.verifiedBookingsCount + 1;

    // Check if mentor should become trusted (5 verified bookings)
    const shouldBeTrusted = newVerifiedCount >= 5;

    // If mentor becomes trusted, release all held funds
    if (shouldBeTrusted && !booking.mentor.isTrusted) {
      // Update mentor to trusted
      await db.mentor.update({
        where: { id: booking.mentorId },
        data: {
          verifiedBookingsCount: newVerifiedCount,
          isTrusted: true,
        },
      });

      // Release all HELD funds for this mentor
      await db.booking.updateMany({
        where: {
          mentorId: booking.mentorId,
          payoutStatus: "HELD",
        },
        data: {
          payoutStatus: "RELEASED",
          payoutReleasedAt: new Date(),
        },
      });

      console.log(`[verify] Mentor ${booking.mentorId} is now TRUSTED. Released all held funds.`);
    } else {
      // Just increment the count
      await db.mentor.update({
        where: { id: booking.mentorId },
        data: {
          verifiedBookingsCount: newVerifiedCount,
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        data: updatedBooking,
        message: shouldBeTrusted
          ? "Booking verified! Mentor is now trusted."
          : `Booking verified! ${5 - newVerifiedCount} more verification(s) needed for mentor to become trusted.`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[api/bookings/verify] POST failed:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
