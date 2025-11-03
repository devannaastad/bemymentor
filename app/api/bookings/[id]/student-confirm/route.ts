// app/api/bookings/[id]/student-confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { processBookingPayout, verifyBooking } from "@/lib/payout-processor";
import { z } from "zod";

const confirmSchema = z.object({
  action: z.enum(["confirm", "report_fraud"]),
  fraudNotes: z.string().optional(),
});

/**
 * POST /api/bookings/[id]/student-confirm
 * Student confirms session completion or reports fraud
 */
export async function POST(
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
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const validation = confirmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { action, fraudNotes } = validation.data;

    // Verify this booking belongs to this user
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        mentor: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.userId !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Not authorized to confirm this booking" },
        { status: 403 }
      );
    }

    // Check if booking is in COMPLETED status
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { ok: false, error: "Booking must be marked as completed by mentor first" },
        { status: 400 }
      );
    }

    // Check if already confirmed or fraud reported
    if (booking.studentConfirmedAt) {
      return NextResponse.json(
        { ok: false, error: "Already confirmed" },
        { status: 400 }
      );
    }

    if (booking.isFraudReported) {
      return NextResponse.json(
        { ok: false, error: "Already reported as fraud" },
        { status: 400 }
      );
    }

    if (action === "confirm") {
      // Student confirms session was good
      const now = new Date();

      await db.booking.update({
        where: { id },
        data: {
          studentConfirmedAt: now,
          isVerified: true,
          verifiedAt: now,
        },
      });

      // Increment mentor's verified bookings count
      await verifyBooking(id);

      // Create in-app notification for mentor
      await db.notification.create({
        data: {
          userId: booking.mentor.userId,
          bookingId: booking.id,
          type: "SESSION_CONFIRMED",
          title: "Student confirmed session",
          message: `${booking.user.name || "A student"} confirmed your completed session. Payment processing will begin.`,
          link: `/mentor-dashboard`,
        },
      });

      // Try to process payout now that student confirmed
      try {
        const payoutResult = await processBookingPayout(id);
        console.log(`[student-confirm] Payout result:`, payoutResult);
      } catch (payoutError) {
        console.error("[student-confirm] Failed to process payout:", payoutError);
        // Don't fail the confirmation, payout can be retried
      }

      return NextResponse.json(
        { ok: true, message: "Session confirmed successfully!" },
        { status: 200 }
      );
    } else {
      // Student reports fraud
      await db.booking.update({
        where: { id },
        data: {
          isFraudReported: true,
          fraudReportedAt: new Date(),
          fraudNotes: fraudNotes || "Student reported fraud",
          payoutStatus: "HELD", // Block payout indefinitely
        },
      });

      // TODO: Send notification to admin for review
      // TODO: Consider temporarily suspending mentor

      return NextResponse.json(
        { ok: true, message: "Fraud report submitted. Our team will review this case." },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("[api/bookings/student-confirm] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
