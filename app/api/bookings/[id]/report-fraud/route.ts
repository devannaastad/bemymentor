// app/api/bookings/[id]/report-fraud/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { id: string };

const reportFraudSchema = z.object({
  reason: z.string().min(10, "Please provide a detailed reason (min 10 characters)"),
});

/**
 * POST /api/bookings/[id]/report-fraud
 * Customer reports booking as fraudulent/scam
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
    const body = await req.json();
    const validation = reportFraudSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    // Get booking with mentor info
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
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
        { ok: false, error: "You can only report your own bookings" },
        { status: 403 }
      );
    }

    // Check if already reported
    if (booking.isFraudReported) {
      return NextResponse.json(
        { ok: false, error: "Fraud already reported for this booking" },
        { status: 400 }
      );
    }

    // Check if already verified
    if (booking.isVerified) {
      return NextResponse.json(
        { ok: false, error: "Cannot report fraud on verified booking" },
        { status: 400 }
      );
    }

    // If mentor is already trusted, require admin review
    // If mentor is NOT trusted yet, automatically process refund
    const autoRefund = !booking.mentor.isTrusted && booking.payoutStatus === "HELD";

    // Mark booking as fraud reported
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        isFraudReported: true,
        fraudReportedAt: new Date(),
        fraudNotes: `Customer report: ${reason}`,
        payoutStatus: autoRefund ? "REFUNDED" : booking.payoutStatus,
        status: "CANCELLED",
        cancellationReason: `Fraud reported by customer: ${reason}`,
      },
    });

    // If auto-refund, we should trigger Stripe refund here
    // For now, just log it
    if (autoRefund) {
      console.log(`[fraud] AUTO-REFUND initiated for booking ${bookingId}. Mentor was not trusted.`);
      // TODO: Trigger Stripe refund via stripePaymentIntentId
    } else {
      console.log(`[fraud] Fraud reported for booking ${bookingId}. Requires admin review (mentor is trusted).`);
    }

    // If mentor has multiple fraud reports, consider flagging them
    const fraudCount = await db.booking.count({
      where: {
        mentorId: booking.mentorId,
        isFraudReported: true,
      },
    });

    if (fraudCount >= 2) {
      // Automatically deactivate mentor after 2+ fraud reports
      await db.mentor.update({
        where: { id: booking.mentorId },
        data: {
          isActive: false,
        },
      });
      console.log(`[fraud] Mentor ${booking.mentorId} DEACTIVATED due to ${fraudCount} fraud reports.`);
    }

    return NextResponse.json(
      {
        ok: true,
        data: updatedBooking,
        message: autoRefund
          ? "Fraud reported. Refund will be processed automatically."
          : "Fraud reported. Our team will review and contact you within 24 hours.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[api/bookings/report-fraud] POST failed:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
