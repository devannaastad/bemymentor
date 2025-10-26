// app/api/bookings/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendBookingCancellation } from "@/lib/email";
import { z } from "zod";
import { format } from "date-fns";

const CancelSchema = z.object({
  reason: z.string().min(10, "Cancellation reason must be at least 10 characters"),
});

type Params = { id: string };

export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params;
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
      select: { id: true, mentorProfile: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = CancelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { reason } = parsed.data;

    // Find the booking
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true } },
        mentor: {
          select: {
            id: true,
            name: true,
            userId: true,
            user: { select: { email: true } }
          }
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user is either the booker or the mentor
    const isBooker = booking.userId === user.id;
    const isMentor = user.mentorProfile?.id === booking.mentorId;

    if (!isBooker && !isMentor) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized to cancel this booking" },
        { status: 403 }
      );
    }

    // Only allow cancelling CONFIRMED or PENDING bookings
    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
      return NextResponse.json(
        { ok: false, error: `Cannot cancel ${booking.status.toLowerCase()} booking` },
        { status: 400 }
      );
    }

    // Process refund if payment was made
    let refundProcessed = false;
    let refundAmount = 0;

    if (booking.stripePaymentIntentId && booking.totalPrice > 0) {
      try {
        // Create a refund in Stripe
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          reason: "requested_by_customer",
        });

        refundProcessed = refund.status === "succeeded" || refund.status === "pending";
        refundAmount = refund.amount;

        console.log("[cancel-booking] Refund processed:", {
          bookingId: id,
          refundId: refund.id,
          amount: refund.amount,
          status: refund.status,
        });
      } catch (refundError) {
        console.error("[cancel-booking] Refund failed:", refundError);
        // Continue with cancellation even if refund fails
        // Admin will need to manually process refund
      }
    }

    // Update the booking
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: refundProcessed || booking.totalPrice === 0 ? "REFUNDED" : "CANCELLED",
        cancellationReason: reason,
        payoutStatus: refundProcessed || booking.totalPrice === 0 ? "REFUNDED" : "HELD",
      },
    });

    // Format session date and time if available
    let sessionDate: string | undefined;
    let sessionTime: string | undefined;

    if (booking.scheduledAt) {
      sessionDate = format(new Date(booking.scheduledAt), "MMMM dd, yyyy");
      sessionTime = format(new Date(booking.scheduledAt), "h:mm a");
    }

    // Send cancellation notification to student
    const studentEmailResult = await sendBookingCancellation({
      to: booking.user.email || "",
      recipientName: booking.user.name || "Student",
      bookingId: id,
      mentorName: booking.mentor.name,
      sessionDate,
      sessionTime,
      cancellationReason: reason,
      refundAmount: refundAmount > 0 ? refundAmount / 100 : undefined, // Convert cents to dollars
      isMentor: false,
    });

    if (!studentEmailResult.ok) {
      console.error("[cancel-booking] Failed to send student email:", studentEmailResult.error);
    }

    // Send cancellation notification to mentor
    const mentorEmailResult = await sendBookingCancellation({
      to: booking.mentor.user.email || "",
      recipientName: booking.mentor.name,
      bookingId: id,
      mentorName: booking.mentor.name,
      sessionDate,
      sessionTime,
      cancellationReason: reason,
      refundAmount: undefined, // Mentors don't need to see refund amount
      isMentor: true,
    });

    if (!mentorEmailResult.ok) {
      console.error("[cancel-booking] Failed to send mentor email:", mentorEmailResult.error);
    }

    return NextResponse.json({
      ok: true,
      data: {
        booking: updatedBooking,
        message: "Booking cancelled successfully",
        refundProcessed,
        refundAmount: refundAmount / 100, // Convert to dollars for display
      },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
