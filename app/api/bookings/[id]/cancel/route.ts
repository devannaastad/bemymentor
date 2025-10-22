// app/api/bookings/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

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
        { ok: false, error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { reason } = parsed.data;

    // Find the booking
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true } },
        mentor: { select: { id: true, name: true, userId: true } },
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

    // Update the booking
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
      },
    });

    // TODO: Process refund if payment was made
    // TODO: Send notification to both parties about the cancellation

    return NextResponse.json({
      ok: true,
      data: {
        booking: updatedBooking,
        message: "Booking cancelled successfully",
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
