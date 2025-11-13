// app/api/mentor/bookings/[id]/meeting-link/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const updateMeetingLinkSchema = z.object({
  meetingLink: z.string().url("Please enter a valid URL (e.g., https://zoom.us/j/123456789)"),
});

/**
 * PATCH /api/mentor/bookings/[id]/meeting-link
 * Add or update meeting link for a confirmed booking
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    if (!user?.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const { id: bookingId } = await params;
    const body = await req.json();

    // Validate input
    const validation = updateMeetingLinkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { meetingLink } = validation.data;

    // Fetch the booking and verify ownership
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        mentorId: true,
        status: true,
        type: true,
        scheduledAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mentor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    // Verify the mentor owns this booking
    if (booking.mentorId !== user.mentorProfile.id) {
      return NextResponse.json(
        { ok: false, error: "You can only update meeting links for your own bookings" },
        { status: 403 }
      );
    }

    // Only allow updating meeting links for SESSION bookings
    if (booking.type !== "SESSION") {
      return NextResponse.json(
        { ok: false, error: "Meeting links can only be added to session bookings" },
        { status: 400 }
      );
    }

    // Only allow updating meeting links for CONFIRMED bookings
    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { ok: false, error: "Meeting links can only be added to confirmed bookings" },
        { status: 400 }
      );
    }

    // Update the meeting link
    await db.booking.update({
      where: { id: bookingId },
      data: { meetingLink },
    });

    // Send notification to student that meeting link was added/updated
    if (booking.user.id) {
      await db.notification.create({
        data: {
          userId: booking.user.id,
          bookingId: booking.id,
          type: "BOOKING_UPDATE",
          title: "Meeting link added",
          message: `${booking.mentor.name} has ${booking.scheduledAt ? 'added' : 'updated'} the meeting link for your upcoming session`,
          link: `/bookings/${booking.id}/confirm`,
        },
      });
    }

    console.log(`[api/mentor/bookings/meeting-link] Meeting link updated for booking ${bookingId}`);

    return NextResponse.json({
      ok: true,
      data: { message: "Meeting link updated successfully" },
    });
  } catch (error) {
    console.error("[api/mentor/bookings/meeting-link] PATCH failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update meeting link" },
      { status: 500 }
    );
  }
}
