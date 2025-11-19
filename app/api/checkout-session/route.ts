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

    // Validate minimum amount (Stripe requires at least $0.50 = 50 cents)
    if (booking.totalPrice < 50) {
      return NextResponse.json(
        { ok: false, error: "Booking amount must be at least $0.50 (Stripe requirement)" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create description based on booking type
    const description =
      booking.type === "ACCESS"
        ? `ACCESS Pass - ${booking.mentor.name}`
        : `${booking.durationMinutes}min 1-on-1 Session with ${booking.mentor.name}`;

    // Get mentor's full profile to check Stripe Connect status
    const mentorFull = await db.mentor.findUnique({
      where: { id: booking.mentor.id },
      select: {
        stripeConnectId: true,
        stripeOnboarded: true,
      },
    });

    console.log("[api/checkout-session] Booking details:", {
      bookingId: booking.id,
      type: booking.type,
      mentorId: booking.mentor.id,
      totalPrice: booking.totalPrice,
      hasStripeConnectId: !!mentorFull?.stripeConnectId,
      isOnboarded: mentorFull?.stripeOnboarded
    });

    // Calculate platform fee (15% of total)
    const platformFeePercent = 0.15;
    const platformFee = Math.round(booking.totalPrice * platformFeePercent);

    // Create checkout session with Stripe Connect if mentor is onboarded
    const checkoutSessionParams: Record<string, unknown> = {
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
    };

    // Add Stripe Connect split if mentor has connected account
    if (mentorFull?.stripeConnectId && mentorFull?.stripeOnboarded) {
      try {
        // Verify the Stripe Connect account exists and is valid
        const account = await stripe.accounts.retrieve(mentorFull.stripeConnectId);

        // Only add payment splitting if account is valid and charges are enabled
        if (account && account.charges_enabled) {
          checkoutSessionParams.payment_intent_data = {
            application_fee_amount: platformFee, // Platform gets 15%
            transfer_data: {
              destination: mentorFull.stripeConnectId, // Mentor gets 85% automatically
            },
          };
          console.log("[api/checkout-session] Using Stripe Connect split for mentor:", booking.mentor.id);
        } else {
          console.warn("[api/checkout-session] Mentor Stripe account exists but charges not enabled:", mentorFull.stripeConnectId);
        }
      } catch (accountError: unknown) {
        // If account doesn't exist or is invalid, log warning and proceed without split
        const errorMessage = accountError instanceof Error ? accountError.message : "Unknown error";
        console.warn("[api/checkout-session] Invalid Stripe Connect account:", mentorFull.stripeConnectId, errorMessage);

        // Mark mentor as not onboarded since their account is invalid
        await db.mentor.update({
          where: { id: booking.mentor.id },
          data: {
            stripeOnboarded: false,
            stripeConnectId: null, // Clear invalid ID
          },
        });
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionParams);

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
