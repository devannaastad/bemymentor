// app/api/subscriptions/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  mentorId: z.string(),
  planId: z.string(),
  userId: z.string(),
});

/**
 * POST /api/subscriptions/checkout
 * Create a Stripe Checkout session for a subscription
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { mentorId, planId, userId } = validation.data;

    // Verify user
    const user = await db.user.findUnique({
      where: { id: userId, email },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get mentor and plan
    const mentor = await db.mentor.findUnique({
      where: { id: mentorId },
      include: {
        subscriptionPlans: {
          where: { id: planId, isActive: true },
        },
      },
    });

    if (!mentor || mentor.subscriptionPlans.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    const plan = mentor.subscriptionPlans[0];

    // Check if mentor has Stripe connected
    if (!mentor.stripeConnectId || !mentor.stripeOnboarded) {
      return NextResponse.json(
        { ok: false, error: "Mentor payment setup incomplete" },
        { status: 400 }
      );
    }

    // Verify Stripe Connect account is valid and active
    try {
      const account = await stripe.accounts.retrieve(mentor.stripeConnectId);

      if (!account.charges_enabled || !account.payouts_enabled) {
        console.error(`[api/subscriptions/checkout] Stripe account ${mentor.stripeConnectId} not fully enabled`);
        return NextResponse.json(
          { ok: false, error: "Mentor's payment account is not fully set up. Please contact the mentor." },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error(`[api/subscriptions/checkout] Invalid Stripe account ${mentor.stripeConnectId}:`, error);

      // Clear invalid Stripe account from database
      await db.mentor.update({
        where: { id: mentor.id },
        data: {
          stripeOnboarded: false,
          stripeConnectId: null,
        },
      });

      return NextResponse.json(
        { ok: false, error: "Mentor's payment account is invalid. The mentor needs to reconnect their payment account." },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const existingSubscription = await db.userSubscription.findFirst({
      where: {
        userId,
        planId,
        status: "ACTIVE",
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { ok: false, error: "You already have an active subscription to this plan" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session for subscription
    // Build base URL from request headers
    const host = req.headers.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    const successUrl = `${baseUrl}/api/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/subscribe/${mentorId}/${planId}?cancelled=true`;

    // Determine the interval for Stripe
    const intervalMap: Record<string, "day" | "week" | "month" | "year"> = {
      WEEKLY: "week",
      MONTHLY: "month",
      YEARLY: "year",
    };

    const stripeInterval = intervalMap[plan.interval];

    // Create or get Stripe Price
    let stripePriceId = plan.stripePriceId;

    if (!stripePriceId) {
      // Create a Stripe Product and Price
      const product = await stripe.products.create({
        name: `${mentor.name} - ${plan.name}`,
        description: plan.description || undefined,
        metadata: {
          mentorId: mentor.id,
          planId: plan.id,
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: "usd",
        recurring: {
          interval: stripeInterval,
        },
        metadata: {
          mentorId: mentor.id,
          planId: plan.id,
        },
      });

      // Update plan with Stripe IDs
      await db.subscriptionPlan.update({
        where: { id: plan.id },
        data: {
          stripeProductId: product.id,
          stripePriceId: price.id,
        },
      });

      stripePriceId = price.id;
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
        mentorId: mentor.id,
        planId: plan.id,
        type: "subscription",
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          mentorId: mentor.id,
          planId: plan.id,
        },
        // Application fee (platform fee)
        application_fee_percent: 15,
        transfer_data: {
          destination: mentor.stripeConnectId,
        },
      },
    });

    console.log(`[api/subscriptions/checkout] Created checkout session ${checkoutSession.id} for user ${user.id}`);

    return NextResponse.json({
      ok: true,
      data: {
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
      },
    });
  } catch (error) {
    console.error("[api/subscriptions/checkout] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
