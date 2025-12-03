// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createBookingSchema } from "@/lib/schemas/booking";

export const runtime = "nodejs";

/**
 * GET /api/bookings
 * Get all bookings for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const bookings = await db.booking.findMany({
      where: { userId: user.id },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            category: true,
            tagline: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { ok: true, data: bookings },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/bookings] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { mentorId, type, scheduledAt, durationMinutes, notes, isFreeSession } = validation.data;

    // Get mentor to calculate price
    const mentor = await db.mentor.findUnique({
      where: { id: mentorId, isActive: true },
      select: {
        id: true,
        name: true,
        offerType: true,
        accessPrice: true,
        hourlyRate: true,
      },
    });

    if (!mentor) {
      return NextResponse.json(
        { ok: false, error: "Mentor not found or inactive" },
        { status: 404 }
      );
    }

    // Calculate price based on booking type
    let totalPrice = 0;

    // If this is a free session, price is 0
    if (isFreeSession && type === "SESSION") {
      totalPrice = 0;
    } else if (type === "ACCESS") {
      if (mentor.offerType === "TIME") {
        return NextResponse.json(
          { ok: false, error: "This mentor only offers sessions, not access" },
          { status: 400 }
        );
      }
      if (!mentor.accessPrice) {
        return NextResponse.json(
          { ok: false, error: "Access price not set for this mentor" },
          { status: 400 }
        );
      }
      totalPrice = mentor.accessPrice; // Already in cents
    } else if (type === "SESSION") {
      if (mentor.offerType === "ACCESS") {
        return NextResponse.json(
          { ok: false, error: "This mentor only offers access, not sessions" },
          { status: 400 }
        );
      }
      if (!mentor.hourlyRate || !durationMinutes) {
        return NextResponse.json(
          { ok: false, error: "Missing session pricing information" },
          { status: 400 }
        );
      }
      // Calculate session price: (hourlyRate / 60) * durationMinutes
      // hourlyRate is already in cents, so no need to multiply by 100
      totalPrice = Math.round((mentor.hourlyRate / 60) * durationMinutes);
    }

    // Create the booking
    // Free sessions are auto-confirmed since no payment is required
    const booking = await db.booking.create({
      data: {
        userId: user.id,
        mentorId: mentor.id,
        type,
        status: isFreeSession ? "CONFIRMED" : "PENDING", // Free sessions auto-confirmed
        totalPrice,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        durationMinutes: durationMinutes || null,
        notes: notes || null,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            category: true,
            tagline: true,
            userId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("[api/bookings] Created booking:", booking.id, "isFreeSession:", isFreeSession);

    // Send confirmation emails immediately for free sessions
    if (isFreeSession && type === "SESSION") {
      try {
        const { sendBookingConfirmation, sendMentorBookingNotification } = await import("@/lib/email");

        // Get mentor's user email
        const mentorUser = await db.user.findUnique({
          where: { id: booking.mentor.userId },
          select: { email: true, name: true },
        });

        // Send email to student
        await sendBookingConfirmation({
          to: booking.user.email!,
          userName: booking.user.name || "Student",
          mentorName: booking.mentor.name,
          bookingType: booking.type,
          totalAmount: booking.totalPrice,
          scheduledAt: booking.scheduledAt?.toISOString() || null,
          durationMinutes: booking.durationMinutes,
          bookingId: booking.id,
        });

        // Send email to mentor
        if (mentorUser?.email) {
          await sendMentorBookingNotification({
            to: mentorUser.email,
            mentorName: booking.mentor.name,
            userName: booking.user.name || "Student",
            userEmail: booking.user.email!,
            bookingType: booking.type,
            totalAmount: booking.totalPrice,
            scheduledAt: booking.scheduledAt?.toISOString() || null,
            durationMinutes: booking.durationMinutes,
            notes: booking.notes,
            bookingId: booking.id,
          });
        }

        console.log("[api/bookings] Free session confirmation emails sent for booking:", booking.id);
      } catch (emailError) {
        console.error("[api/bookings] Failed to send free session confirmation emails:", emailError);
        // Don't fail the booking creation - email is nice to have
      }
    }

    return NextResponse.json(
      { ok: true, data: booking },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/bookings] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}