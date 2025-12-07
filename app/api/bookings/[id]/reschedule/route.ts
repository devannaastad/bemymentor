// app/api/bookings/[id]/reschedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendBookingReschedule } from "@/lib/email";
import { z } from "zod";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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
        user: { select: { email: true, name: true, timezone: true } },
        mentor: {
          select: {
            id: true,
            name: true,
            userId: true,
            timezone: true,
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

    // Get user timezones
    const studentTimezone = booking.user.timezone || "America/New_York";
    const mentorTimezone = booking.mentor.timezone || "America/New_York";

    // Format old dates for student and mentor
    const oldScheduledAt = booking.scheduledAt;
    let oldDateStudent: string | undefined;
    let oldTimeStudent: string | undefined;
    let oldDateMentor: string | undefined;
    let oldTimeMentor: string | undefined;

    if (oldScheduledAt) {
      const oldDateObj = new Date(oldScheduledAt);

      // Student's timezone
      const oldStudentTime = toZonedTime(oldDateObj, studentTimezone);
      oldDateStudent = format(oldStudentTime, "MMMM dd, yyyy");
      oldTimeStudent = format(oldStudentTime, "h:mm a");

      // Mentor's timezone
      const oldMentorTime = toZonedTime(oldDateObj, mentorTimezone);
      oldDateMentor = format(oldMentorTime, "MMMM dd, yyyy");
      oldTimeMentor = format(oldMentorTime, "h:mm a");
    }

    // Format new dates for student and mentor
    const newStudentTime = toZonedTime(newDate, studentTimezone);
    const newDateFormattedStudent = format(newStudentTime, "MMMM dd, yyyy");
    const newTimeFormattedStudent = format(newStudentTime, "h:mm a");

    const newMentorTime = toZonedTime(newDate, mentorTimezone);
    const newDateFormattedMentor = format(newMentorTime, "MMMM dd, yyyy");
    const newTimeFormattedMentor = format(newMentorTime, "h:mm a");

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

    // Send reschedule notification to student (with student's timezone)
    const studentEmailResult = await sendBookingReschedule({
      to: booking.user.email || "",
      recipientName: booking.user.name || "Student",
      bookingId: id,
      mentorName: booking.mentor.name,
      oldDate: oldDateStudent,
      oldTime: oldTimeStudent,
      newDate: newDateFormattedStudent,
      newTime: newTimeFormattedStudent,
      reason,
      isMentor: false,
      initiatedByMentor,
    });

    if (!studentEmailResult.ok) {
      console.error("[reschedule-booking] Failed to send student email:", studentEmailResult.error);
    }

    // Send reschedule notification to mentor (with mentor's timezone)
    const mentorEmailResult = await sendBookingReschedule({
      to: booking.mentor.user.email || "",
      recipientName: booking.mentor.name,
      bookingId: id,
      mentorName: booking.mentor.name,
      oldDate: oldDateMentor,
      oldTime: oldTimeMentor,
      newDate: newDateFormattedMentor,
      newTime: newTimeFormattedMentor,
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
