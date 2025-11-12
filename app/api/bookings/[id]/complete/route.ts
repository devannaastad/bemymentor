// app/api/bookings/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updatePayoutSchedule, shouldUpgradeToTrusted } from "@/lib/stripe-connect";

export const runtime = "nodejs";

/**
 * POST /api/bookings/[id]/complete
 * Mark a session as complete with verification questionnaire
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await req.json();
    const { worthIt, wouldRecommend, issuesReported } = body;

    // Validate questionnaire responses
    if (typeof worthIt !== "boolean" || typeof wouldRecommend !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "Missing required questionnaire responses" },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        mentor: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user owns this booking
    if (booking.user.email !== session.user.email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if already completed
    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { ok: false, error: "Booking already completed" },
        { status: 400 }
      );
    }

    // Only CONFIRMED bookings can be completed
    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { ok: false, error: "Booking must be confirmed before completion" },
        { status: 400 }
      );
    }

    // Mark as verified if student confirms it was worth it
    const isVerified = worthIt && wouldRecommend && !issuesReported;

    // Update booking status
    await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "COMPLETED",
        studentConfirmedAt: new Date(),
        isVerified: isVerified,
        verifiedAt: isVerified ? new Date() : null,
      },
    });

    // If verified, increment mentor's verified booking count
    if (isVerified) {
      const updatedMentor = await db.mentor.update({
        where: { id: booking.mentorId },
        data: {
          verifiedBookingsCount: { increment: 1 },
        },
      });

      // Check if mentor should be upgraded to trusted status
      if (shouldUpgradeToTrusted(updatedMentor.verifiedBookingsCount, updatedMentor.isTrusted)) {
        // Upgrade to trusted
        await db.mentor.update({
          where: { id: booking.mentorId },
          data: { isTrusted: true },
        });

        // Update Stripe payout schedule to daily (instant payouts)
        if (updatedMentor.stripeConnectId) {
          await updatePayoutSchedule(updatedMentor.stripeConnectId, true);
        }

        console.log(`[complete] Mentor ${booking.mentorId} upgraded to trusted status!`);
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        verified: isVerified,
        message: isVerified
          ? "Session verified successfully"
          : "Session marked as complete",
      },
    });
  } catch (err) {
    console.error("[api/bookings/complete] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to complete booking" },
      { status: 500 }
    );
  }
}
