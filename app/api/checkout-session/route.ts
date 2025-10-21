// app/api/checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

export const runtime = "nodejs";

const createCheckoutSchema = z.object({
  bookingId: z.string().min(1),
});

/**
 * POST /api/checkout-session
 * Create a Stripe checkout session for a booking
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
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = createCheckoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { bookingId } = validation.data;

    // Get booking with mentor details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            category: true,
            tagline: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify booking belongs to user
    if (booking.userId !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized access to booking" },
        { status: 403 }
      );
    }

    // Check if booking already has a payment intent (prevent duplicate payments)
    if (booking.stripePaymentIntentId) {
      return NextResponse.json(
        { ok: false, error: "Booking already has a payment associated" },
        { status: 400 }
      );
    }

    // Check if booking is in correct status
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { ok: false, error: "Booking is not in pending status" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create description based on booking type
    const description =
      booking.type === "ACCESS"
        ? `ACCESS Pass - ${booking.mentor.name}`
        : `${booking.durationMinutes}min 1-on-1 Session with ${booking.mentor.name}`;

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description,
              description: booking.mentor.tagline,
              metadata: {
                mentorId: booking.mentor.id,
                mentorName: booking.mentor.name,
                bookingType: booking.type,
              },
            },
            unit_amount: booking.totalPrice, // Already in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        userId: user.id,
        mentorId: booking.mentor.id,
        bookingType: booking.type,
      },
      success_url: `${appUrl}/bookings/${booking.id}/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/bookings/${booking.id}/confirm?canceled=true`,
    });

    console.log("[api/checkout-session] Created session:", checkoutSession.id, "for booking:", booking.id);

    return NextResponse.json(
      {
        ok: true,
        data: {
          sessionId: checkoutSession.id,
          url: checkoutSession.url,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[api/checkout-session] POST failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
