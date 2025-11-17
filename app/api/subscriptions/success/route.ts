// app/api/subscriptions/success/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Calculate the end of the billing period based on start timestamp and interval
 */
function calculatePeriodEnd(startTimestamp: number, interval: string): number {
  const startDate = new Date(startTimestamp * 1000);
  const endDate = new Date(startDate);

  switch (interval) {
    case 'WEEKLY':
      endDate.setDate(endDate.getDate() + 7);
      break;
    case 'MONTHLY':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'YEARLY':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      // Default to monthly
      endDate.setMonth(endDate.getMonth() + 1);
  }

  return Math.floor(endDate.getTime() / 1000);
}

/**
 * GET /api/subscriptions/success?session_id=xxx
 * Retrieve subscription from Stripe checkout session and redirect to success page
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.subscription) {
      console.error("[subscriptions/success] No subscription in session:", sessionId);
      return NextResponse.redirect(new URL("/dashboard?error=no_subscription", req.url));
    }

    // Wait for webhook to create UserSubscription (with retries)
    let userSubscription = null;
    const maxRetries = 10;
    const retryDelay = 500; // 500ms

    for (let i = 0; i < maxRetries; i++) {
      userSubscription = await db.userSubscription.findFirst({
        where: { stripeSubscriptionId: session.subscription as string },
      });

      if (userSubscription) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }

    if (!userSubscription) {
      console.log("[subscriptions/success] UserSubscription not found, creating it now (webhook may not have fired)");

      // Retrieve full subscription details from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ['customer', 'latest_invoice', 'latest_invoice.lines'] }
      );

      // Get metadata from session or subscription
      const subMetadata = stripeSubscription.metadata as Record<string, string> | undefined;
      const userId = session.metadata?.userId || subMetadata?.userId;
      const mentorId = session.metadata?.mentorId || subMetadata?.mentorId;
      const planId = session.metadata?.planId || subMetadata?.planId;

      if (!userId || !mentorId || !planId) {
        console.error("[subscriptions/success] Missing metadata:", { userId, mentorId, planId });
        return NextResponse.redirect(
          new URL("/dashboard?error=missing_subscription_data", req.url)
        );
      }

      // Get our plan to determine the interval
      const ourPlan = await db.subscriptionPlan.findUnique({
        where: { id: planId },
        select: { interval: true },
      });

      const sub = stripeSubscription as unknown as Record<string, unknown>;

      // Use billing_cycle_anchor for start date
      const currentPeriodStart = (sub.billing_cycle_anchor as number) || (sub.created as number) || (sub.start_date as number);

      // Try to get period end from the latest invoice's lines
      let currentPeriodEnd = currentPeriodStart;

      if (sub.latest_invoice && typeof sub.latest_invoice === 'object') {
        const invoice = sub.latest_invoice as Record<string, unknown>;
        const lines = invoice.lines as { data?: Array<{ period?: { end?: number } }> } | undefined;
        const firstLine = lines?.data?.[0];

        // Check if the invoice has lines with period information
        if (firstLine?.period?.end) {
          currentPeriodEnd = firstLine.period.end;
        } else if (typeof invoice.period_end === 'number') {
          currentPeriodEnd = invoice.period_end;
        } else {
          // Calculate based on our plan's interval
          currentPeriodEnd = calculatePeriodEnd(currentPeriodStart, ourPlan?.interval || 'MONTHLY');
        }
      } else {
        // Calculate based on our plan's interval
        currentPeriodEnd = calculatePeriodEnd(currentPeriodStart, ourPlan?.interval || 'MONTHLY');
      }

      console.log("[subscriptions/success] Using timestamps:", {
        currentPeriodStart,
        currentPeriodEnd,
        interval: ourPlan?.interval,
        billing_cycle_anchor: sub.billing_cycle_anchor,
        created: sub.created
      });

      // Create UserSubscription record
      userSubscription = await db.userSubscription.create({
        data: {
          userId,
          mentorId,
          planId,
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: typeof stripeSubscription.customer === "string"
            ? stripeSubscription.customer
            : stripeSubscription.customer.id,
          status: stripeSubscription.status === "active" ? "ACTIVE" : "PAUSED",
          currentPeriodStart: new Date(currentPeriodStart * 1000),
          currentPeriodEnd: new Date(currentPeriodEnd * 1000),
          cancelAtPeriodEnd: (sub.cancel_at_period_end as boolean) || false,
        },
      });

      console.log("[subscriptions/success] Created UserSubscription:", userSubscription.id);
    }

    // Redirect to subscription success page
    return NextResponse.redirect(new URL(`/subscription/${userSubscription.id}/success`, req.url));
  } catch (error) {
    console.error("[subscriptions/success] Error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=subscription_error", req.url));
  }
}
