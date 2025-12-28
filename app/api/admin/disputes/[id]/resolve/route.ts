// app/api/admin/disputes/[id]/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { issueRefund, reverseTransfer } from "@/lib/stripe-connect";
import { createPayout } from "@/lib/stripe-connect";
import { z } from "zod";

export const runtime = "nodejs";

const resolveSchema = z.object({
  decision: z.enum([
    "REFUND_STUDENT_FULL",
    "REFUND_STUDENT_PARTIAL",
    "PAYOUT_MENTOR_FULL",
    "SPLIT_50_50",
    "UNDER_REVIEW",
    "NO_ACTION",
  ]),
  adminNotes: z.string().optional(),
  customRefundAmount: z.number().optional(), // For REFUND_STUDENT_PARTIAL
});

/**
 * POST /api/admin/disputes/[id]/resolve
 * Resolve a dispute with admin decision
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();

    const validation = resolveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { decision, adminNotes, customRefundAmount } = validation.data;

    // Get booking with all details
    const booking = await db.booking.findUnique({
      where: { id },
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

    if (!booking.isFraudReported) {
      return NextResponse.json(
        { ok: false, error: "This booking has no fraud report" },
        { status: 400 }
      );
    }

    if (!booking.stripePaymentIntentId) {
      return NextResponse.json(
        { ok: false, error: "No payment to refund" },
        { status: 400 }
      );
    }

    let refundAmount = 0;
    let payoutAmount = 0;
    let stripeRefundId: string | undefined;
    let stripePayoutId: string | undefined;
    let newStatus = booking.status;
    let newPayoutStatus = booking.payoutStatus;

    // Execute decision
    switch (decision) {
      case "REFUND_STUDENT_FULL":
        // Refund full amount to student
        refundAmount = booking.totalPrice;
        newStatus = "REFUNDED";
        newPayoutStatus = "REFUNDED";

        // If mentor was already paid, reverse the transfer
        if (booking.payoutId && booking.payoutStatus === "PAID_OUT") {
          try {
            await reverseTransfer(booking.payoutId);
            console.log(`[admin:resolve] Reversed transfer ${booking.payoutId}`);
          } catch (err) {
            console.error("[admin:resolve] Failed to reverse transfer:", err);
            // Continue with refund anyway
          }
        }

        // Issue refund to student
        try {
          const refund = await issueRefund(
            booking.stripePaymentIntentId,
            refundAmount,
            "fraudulent"
          );
          stripeRefundId = refund.id;
          console.log(`[admin:resolve] Refunded $${refundAmount / 100} to student`);
        } catch (err) {
          console.error("[admin:resolve] Failed to issue refund:", err);
          throw new Error("Failed to process refund");
        }
        break;

      case "REFUND_STUDENT_PARTIAL":
        // Partial refund to student, rest goes to mentor
        refundAmount = customRefundAmount || Math.round(booking.totalPrice * 0.5);
        payoutAmount = booking.totalPrice - refundAmount;
        newPayoutStatus = "PAID_OUT";

        // Issue partial refund
        try {
          const refund = await issueRefund(
            booking.stripePaymentIntentId,
            refundAmount,
            "requested_by_customer"
          );
          stripeRefundId = refund.id;
          console.log(`[admin:resolve] Partial refund $${refundAmount / 100} to student`);
        } catch (err) {
          console.error("[admin:resolve] Failed to issue partial refund:", err);
          throw new Error("Failed to process partial refund");
        }

        // Pay out remaining to mentor
        if (booking.mentor.stripeConnectId && payoutAmount > 0) {
          try {
            const transfer = await createPayout(
              booking.mentor.stripeConnectId,
              payoutAmount,
              booking.id,
              `Partial payout after dispute resolution`
            );
            stripePayoutId = transfer.id;
            console.log(`[admin:resolve] Paid $${payoutAmount / 100} to mentor`);
          } catch (err) {
            console.error("[admin:resolve] Failed to pay mentor:", err);
            // Refund was successful, just log the payout failure
          }
        }
        break;

      case "PAYOUT_MENTOR_FULL":
        // Full payout to mentor, no refund
        payoutAmount = booking.mentorPayout || booking.totalPrice;
        newPayoutStatus = "PAID_OUT";

        if (booking.mentor.stripeConnectId) {
          try {
            const transfer = await createPayout(
              booking.mentor.stripeConnectId,
              payoutAmount,
              booking.id,
              `Full payout - dispute resolved in mentor's favor`
            );
            stripePayoutId = transfer.id;
            console.log(`[admin:resolve] Paid full amount $${payoutAmount / 100} to mentor`);
          } catch (err) {
            console.error("[admin:resolve] Failed to pay mentor:", err);
            throw new Error("Failed to process payout");
          }
        }
        break;

      case "SPLIT_50_50":
        // Split 50/50
        refundAmount = Math.round(booking.totalPrice * 0.5);
        payoutAmount = booking.totalPrice - refundAmount;
        newPayoutStatus = "PAID_OUT";

        // Refund half to student
        try {
          const refund = await issueRefund(
            booking.stripePaymentIntentId,
            refundAmount,
            "requested_by_customer"
          );
          stripeRefundId = refund.id;
        } catch (err) {
          console.error("[admin:resolve] Failed to issue 50% refund:", err);
          throw new Error("Failed to process refund");
        }

        // Pay half to mentor
        if (booking.mentor.stripeConnectId) {
          try {
            const transfer = await createPayout(
              booking.mentor.stripeConnectId,
              payoutAmount,
              booking.id,
              `50/50 split after dispute resolution`
            );
            stripePayoutId = transfer.id;
          } catch (err) {
            console.error("[admin:resolve] Failed to pay mentor:", err);
          }
        }
        break;

      case "UNDER_REVIEW":
        // Just mark as under review, no financial action
        newPayoutStatus = "HELD";
        break;

      case "NO_ACTION":
        // Dismiss dispute, proceed normally
        newPayoutStatus = "HELD"; // Will be processed by normal payout flow
        break;
    }

    // Update booking with resolution
    const updated = await db.booking.update({
      where: { id },
      data: {
        adminReviewedAt: new Date(),
        adminReviewedBy: admin?.user?.email || "Unknown admin",
        adminDecision: decision,
        adminNotes: adminNotes || undefined,
        refundAmount: refundAmount > 0 ? refundAmount : undefined,
        stripeRefundId,
        payoutId: stripePayoutId || booking.payoutId,
        payoutStatus: newPayoutStatus,
        status: newStatus,
        payoutReleasedAt: stripePayoutId ? new Date() : booking.payoutReleasedAt,
      },
    });

    // Create notification for student
    await db.notification.create({
      data: {
        userId: booking.userId,
        bookingId: booking.id,
        type: "DISPUTE_RESOLVED",
        title: "Dispute resolved",
        message: `Your dispute has been reviewed and resolved. ${
          refundAmount > 0 ? `Refund of $${(refundAmount / 100).toFixed(2)} has been processed.` : ""
        }`,
        link: `/bookings/${booking.id}`,
      },
    });

    // Create notification for mentor
    await db.notification.create({
      data: {
        userId: booking.mentor.userId,
        bookingId: booking.id,
        type: "DISPUTE_RESOLVED",
        title: "Dispute resolved",
        message: `The dispute for booking ${booking.id} has been resolved. ${
          payoutAmount > 0 ? `Payment of $${(payoutAmount / 100).toFixed(2)} has been processed.` : ""
        }`,
        link: `/mentor-dashboard`,
      },
    });

    console.log(`[admin:resolve] Dispute resolved:`, {
      bookingId: id,
      decision,
      refundAmount: refundAmount / 100,
      payoutAmount: payoutAmount / 100,
    });

    return NextResponse.json({
      ok: true,
      data: {
        booking: updated,
        refundAmount,
        payoutAmount,
        stripeRefundId,
        stripePayoutId,
      },
    });
  } catch (error) {
    console.error("[admin:resolve] POST failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to resolve dispute",
      },
      { status: 500 }
    );
  }
}
