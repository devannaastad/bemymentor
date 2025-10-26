// app/api/bookings/[id]/reschedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendBookingReschedule } from "@/lib/email";
import { z } from "zod";
import { format } from "date-fns";

const RescheduleSchema = z.object({
  newScheduledAt: z.string().datetime(),
  reason: z.string().optional(),
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
    const parsed = RescheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const { newScheduledAt, reason } = parsed.data;

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
        { ok: false, error: "Unauthorized to reschedule this booking" },
        { status: 403 }
      );
    }

    // Only allow rescheduling for SESSION bookings
    if (booking.type !== "SESSION") {
      return NextResponse.json(
        { ok: false, error: "Only session bookings can be rescheduled" },
        { status: 400 }
      );
    }

    // Only allow rescheduling CONFIRMED bookings
    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { ok: false, error: "Only confirmed bookings can be rescheduled" },
        { status: 400 }
      );
    }

    // Validate the new date is in the future
    const newDate = new Date(newScheduledAt);
    const now = new Date();

    if (newDate <= now) {
      return NextResponse.json(
        { ok: false, error: "New date must be in the future" },
        { status: 400 }
      );
    }

    // Determine who initiated the reschedule
    const initiatedByMentor = isMentor;

    // Format old and new dates
    const oldScheduledAt = booking.scheduledAt;
    let oldDate: string | undefined;
    let oldTime: string | undefined;

    if (oldScheduledAt) {
      oldDate = format(new Date(oldScheduledAt), "MMMM dd, yyyy");
      oldTime = format(new Date(oldScheduledAt), "h:mm a");
    }

    const newDateFormatted = format(newDate, "MMMM dd, yyyy");
    const newTimeFormatted = format(newDate, "h:mm a");

    // Update the booking
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        scheduledAt: newDate,
        notes: reason
          ? `${booking.notes || ""}\n\nRescheduled: ${reason}`.trim()
          : booking.notes,
      },
    });

    // Send reschedule notification to student
    const studentEmailResult = await sendBookingReschedule({
      to: booking.user.email || "",
      recipientName: booking.user.name || "Student",
      bookingId: id,
      mentorName: booking.mentor.name,
      oldDate,
      oldTime,
      newDate: newDateFormatted,
      newTime: newTimeFormatted,
      reason,
      isMentor: false,
      initiatedByMentor,
    });

    if (!studentEmailResult.ok) {
      console.error("[reschedule-booking] Failed to send student email:", studentEmailResult.error);
    }

    // Send reschedule notification to mentor
    const mentorEmailResult = await sendBookingReschedule({
      to: booking.mentor.user.email || "",
      recipientName: booking.mentor.name,
      bookingId: id,
      mentorName: booking.mentor.name,
      oldDate,
      oldTime,
      newDate: newDateFormatted,
      newTime: newTimeFormatted,
      reason,
      isMentor: true,
      initiatedByMentor,
    });

    if (!mentorEmailResult.ok) {
      console.error("[reschedule-booking] Failed to send mentor email:", mentorEmailResult.error);
    }

    return NextResponse.json({
      ok: true,
      data: {
        booking: updatedBooking,
        message: "Booking rescheduled successfully",
      },
    });
  } catch (error) {
    console.error("Reschedule booking error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
