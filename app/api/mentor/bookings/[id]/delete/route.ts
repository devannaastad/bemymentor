// app/api/mentor/bookings/[id]/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * DELETE /api/mentor/bookings/[id]/delete
 * Delete a completed booking (mentor only)
 */
export async function DELETE(
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

    // Fetch the booking and verify ownership
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        mentorId: true,
        status: true,
        studentConfirmedAt: true,
        mentorCompletedAt: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    // Verify the mentor owns this booking
    if (booking.mentorId !== user.mentorProfile.id) {
      return NextResponse.json(
        { ok: false, error: "You can only delete your own bookings" },
        { status: 403 }
      );
    }

    // Allow deletion of COMPLETED, CANCELLED, or REFUNDED bookings
    if (booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && booking.status !== "REFUNDED") {
      return NextResponse.json(
        { ok: false, error: "Only completed, cancelled, or refunded bookings can be deleted" },
        { status: 400 }
      );
    }

    // Delete the booking (cascade will handle related messages, notifications, etc.)
    await db.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({
      ok: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("[api/mentor/bookings/delete] DELETE failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
