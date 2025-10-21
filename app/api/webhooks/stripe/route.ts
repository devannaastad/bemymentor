// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendBookingConfirmation, sendMentorBookingNotification } from "@/lib/email";
import Stripe from "stripe";

export const runtime = "nodejs";

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("[stripe-webhook] No signature provided");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 400 }
    );
  }

  console.log("[stripe-webhook] Event received:", event.type, event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[stripe-webhook] PaymentIntent succeeded:", paymentIntent.id);
        // Additional handling if needed
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("[stripe-webhook] PaymentIntent failed:", paymentIntent.id);
        // Handle failed payment
        break;
      }

      default:
        console.log("[stripe-webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[stripe-webhook] Error processing event:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("[stripe-webhook] Processing checkout.session.completed:", session.id);

  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    console.error("[stripe-webhook] No bookingId in session metadata");
    return;
  }

  // Get booking
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      mentor: {
        select: {
          id: true,
          name: true,
          userId: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!booking) {
    console.error("[stripe-webhook] Booking not found:", bookingId);
    return;
  }

  // Check if already processed
  if (booking.stripePaymentIntentId) {
    console.log("[stripe-webhook] Booking already processed:", bookingId);
    return;
  }

  // Update booking with payment info
  const updatedBooking = await db.booking.update({
    where: { id: bookingId },
    data: {
      stripePaymentIntentId: session.payment_intent as string,
      stripePaidAt: new Date(),
      status: "CONFIRMED", // Move to CONFIRMED after successful payment
    },
  });

  console.log("[stripe-webhook] Booking updated to CONFIRMED:", updatedBooking.id);

  // Get mentor's user email for notification
  const mentorUser = await db.user.findUnique({
    where: { id: booking.mentor.userId },
    select: { email: true },
  });

  // Send confirmation emails
  try {
    // Email to user (learner)
    if (booking.user.email) {
      await sendBookingConfirmation({
        to: booking.user.email,
        userName: booking.user.name || "there",
        mentorName: booking.mentor.name,
        bookingType: booking.type,
        totalAmount: booking.totalPrice,
        scheduledAt: booking.scheduledAt?.toISOString() || null,
        durationMinutes: booking.durationMinutes,
        bookingId: booking.id,
      });
    }

    // Email to mentor
    if (mentorUser?.email) {
      await sendMentorBookingNotification({
        to: mentorUser.email,
        mentorName: booking.mentor.name,
        userName: booking.user.name || "A student",
        userEmail: booking.user.email || "",
        bookingType: booking.type,
        totalAmount: booking.totalPrice,
        scheduledAt: booking.scheduledAt?.toISOString() || null,
        durationMinutes: booking.durationMinutes,
        notes: booking.notes,
        bookingId: booking.id,
      });
    }

    console.log("[stripe-webhook] Confirmation emails sent successfully");
  } catch (emailError) {
    console.error("[stripe-webhook] Failed to send emails:", emailError);
    // Don't throw - booking is already confirmed, email failure shouldn't break the flow
  }
}
