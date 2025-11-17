// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendBookingConfirmation, sendMentorBookingNotification } from "@/lib/email";
import { calculatePayoutAmounts } from "@/lib/stripe-connect";
import { processBookingPayout } from "@/lib/payout-processor";
import { autoGenerateMeetingLink } from "@/lib/meeting-links";
import Stripe from "stripe";

export const runtime = "nodejs";

// Helper type for Stripe Subscription with period dates
type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at?: number | null;
};

// Helper type for Stripe Invoice with subscription
type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | null;
};

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

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
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

  const type = session.metadata?.type;

  // Handle subscription checkout
  if (type === "subscription") {
    // Subscription will be created via customer.subscription.created webhook
    console.log("[stripe-webhook] Subscription checkout completed, waiting for subscription.created event");
    return;
  }

  // Handle booking checkout
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

  // Calculate platform fee and mentor payout
  const { platformFee, mentorPayout } = calculatePayoutAmounts(booking.totalPrice);

  // Get mentor's full profile to check meeting preferences
  const mentorProfile = await db.mentor.findUnique({
    where: { id: booking.mentor.id },
    select: {
      autoGenerateMeetingLinks: true,
      meetingPlatform: true,
      customMeetingLink: true,
    },
  });

  // Auto-generate meeting link if enabled
  let meetingLink = booking.meetingLink; // Keep existing if already set
  if (!meetingLink && mentorProfile?.autoGenerateMeetingLinks && booking.type === "SESSION") {
    if (mentorProfile.meetingPlatform === "custom" && mentorProfile.customMeetingLink) {
      meetingLink = mentorProfile.customMeetingLink;
    } else {
      const platform = mentorProfile.meetingPlatform as "google" | "zoom" | "generic";
      meetingLink = autoGenerateMeetingLink(bookingId, platform);
    }
  }

  // Update booking with payment info
  const updatedBooking = await db.booking.update({
    where: { id: bookingId },
    data: {
      stripePaymentIntentId: session.payment_intent as string,
      stripePaidAt: new Date(),
      status: "CONFIRMED", // Move to CONFIRMED after successful payment
      platformFee,
      mentorPayout,
      meetingLink: meetingLink || undefined,
    },
  });

  console.log("[stripe-webhook] Booking updated to CONFIRMED:", updatedBooking.id);
  console.log(`[stripe-webhook] Platform fee: $${platformFee / 100}, Mentor payout: $${mentorPayout / 100}`);

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

  // Process payout for ACCESS bookings using new anti-fraud system
  // Note: ACCESS bookings processed here, SESSION bookings when marked COMPLETED
  if (booking.type === "ACCESS") {
    try {
      const payoutResult = await processBookingPayout(updatedBooking.id);

      if (payoutResult?.status === "HELD" && "releaseDate" in payoutResult) {
        console.log(`[stripe-webhook] Payout HELD until ${payoutResult.releaseDate}: ${payoutResult.reason}`);
      } else if (payoutResult?.status === "PAID_OUT" && "transferId" in payoutResult) {
        console.log(`[stripe-webhook] Payout PAID_OUT immediately (trusted mentor): ${payoutResult.transferId}`);
      }
    } catch (payoutError) {
      console.error("[stripe-webhook] Failed to process payout:", payoutError);
      // Don't throw - booking is confirmed, payout can be retried later
    }
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("[stripe-webhook] Processing customer.subscription.created:", subscription.id);

  const userId = subscription.metadata?.userId;
  const mentorId = subscription.metadata?.mentorId;
  const planId = subscription.metadata?.planId;

  if (!userId || !mentorId || !planId) {
    console.error("[stripe-webhook] Missing metadata in subscription:", subscription.id);
    return;
  }

  // Check if subscription already exists
  const existing = await db.userSubscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (existing) {
    console.log("[stripe-webhook] Subscription already exists:", subscription.id);
    return;
  }

  // Create UserSubscription record
  const sub = subscription as StripeSubscriptionWithPeriod;
  await db.userSubscription.create({
    data: {
      userId,
      mentorId,
      planId,
      stripeSubscriptionId: sub.id,
      stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      status: sub.status === "active" ? "ACTIVE" : "PAUSED",
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });

  console.log("[stripe-webhook] UserSubscription created for:", subscription.id);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("[stripe-webhook] Processing customer.subscription.updated:", subscription.id);

  const userSubscription = await db.userSubscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!userSubscription) {
    console.error("[stripe-webhook] UserSubscription not found for:", subscription.id);
    return;
  }

  // Map Stripe status to our status
  const sub = subscription as StripeSubscriptionWithPeriod;
  let status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAUSED" = "ACTIVE";
  if (sub.status === "canceled" || sub.status === "unpaid") {
    status = "CANCELLED";
  } else if (sub.status === "paused") {
    status = "PAUSED";
  } else if (sub.status === "active") {
    status = "ACTIVE";
  }

  // Update subscription
  await db.userSubscription.update({
    where: { id: userSubscription.id },
    data: {
      status,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      cancelledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    },
  });

  console.log("[stripe-webhook] UserSubscription updated:", userSubscription.id, "status:", status);
}

/**
 * Handle subscription deleted/cancelled event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[stripe-webhook] Processing customer.subscription.deleted:", subscription.id);

  const userSubscription = await db.userSubscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!userSubscription) {
    console.error("[stripe-webhook] UserSubscription not found for:", subscription.id);
    return;
  }

  // Mark as cancelled
  await db.userSubscription.update({
    where: { id: userSubscription.id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelAtPeriodEnd: false,
    },
  });

  console.log("[stripe-webhook] UserSubscription cancelled:", userSubscription.id);
}

/**
 * Handle invoice payment succeeded (recurring subscription payment)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("[stripe-webhook] Processing invoice.payment_succeeded:", invoice.id);

  const inv = invoice as StripeInvoiceWithSubscription;
  if (!inv.subscription) {
    // Not a subscription invoice
    return;
  }

  const userSubscription = await db.userSubscription.findFirst({
    where: { stripeSubscriptionId: inv.subscription },
  });

  if (!userSubscription) {
    console.error("[stripe-webhook] UserSubscription not found for subscription:", inv.subscription);
    return;
  }

  // Update subscription status to active
  await db.userSubscription.update({
    where: { id: userSubscription.id },
    data: {
      status: "ACTIVE",
    },
  });

  console.log("[stripe-webhook] Subscription payment successful:", userSubscription.id);
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("[stripe-webhook] Processing invoice.payment_failed:", invoice.id);

  const inv = invoice as StripeInvoiceWithSubscription;
  if (!inv.subscription) {
    // Not a subscription invoice
    return;
  }

  const userSubscription = await db.userSubscription.findFirst({
    where: { stripeSubscriptionId: inv.subscription },
  });

  if (!userSubscription) {
    console.error("[stripe-webhook] UserSubscription not found for subscription:", inv.subscription);
    return;
  }

  // Could update status to PAUSED or send notification to user
  console.log("[stripe-webhook] Subscription payment failed:", userSubscription.id);
  // TODO: Send email notification to user about failed payment
}
