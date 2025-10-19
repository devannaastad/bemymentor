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

    const { mentorId, type, scheduledAt, durationMinutes, notes } = validation.data;

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
    
    if (type === "ACCESS") {
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
      totalPrice = mentor.accessPrice * 100; // Convert to cents
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
      totalPrice = Math.round((mentor.hourlyRate / 60) * durationMinutes * 100); // Convert to cents
    }

    // Create the booking
    const booking = await db.booking.create({
      data: {
        userId: user.id,
        mentorId: mentor.id,
        type,
        status: "PENDING", // Will be CONFIRMED after payment
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
          },
        },
      },
    });

    console.log("[api/bookings] Created booking:", booking.id);

    return NextResponse.json(
      { ok: true, data: booking },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/bookings] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}