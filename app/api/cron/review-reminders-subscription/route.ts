// app/api/cron/review-reminders-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendReviewReminder } from "@/lib/email";
import { format, subDays } from "date-fns";

export const runtime = "nodejs";

/**
 * GET /api/cron/review-reminders-subscription
 * Send review reminders for active subscriptions (once every 30 days)
 * Run this daily via cron
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error("[cron:review-reminders-subscription] Unauthorized");
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    console.log("[cron:review-reminders-subscription] Starting review reminder job");

    const now = new Date();

    // Find active subscriptions that:
    // 1. Are at least 30 days old (had time to experience the content)
    // 2. Haven't had a review reminder sent in the last 30 days (or never)
    const thirtyDaysAgo = subDays(now, 30);
    const thirtyOneDaysAgo = subDays(now, 31);

    const activeSubscriptions = await db.userSubscription.findMany({
      where: {
        status: "ACTIVE",
        createdAt: {
          lte: thirtyDaysAgo, // At least 30 days old
        },
        OR: [
          // Never sent a reminder
          { lastReviewReminderSentAt: null },
          // Last reminder was sent 30+ days ago
          {
            lastReviewReminderSentAt: {
              lte: thirtyOneDaysAgo,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        mentor: {
          select: {
            name: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
        reviews: {
          where: {
            type: "SUBSCRIPTION",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    console.log(
      `[cron:review-reminders-subscription] Found ${activeSubscriptions.length} subscriptions needing review reminders`
    );

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const subscription of activeSubscriptions) {
      try {
        // Skip if no email
        if (!subscription.user.email) {
          console.log(`[cron:review-reminders-subscription] Skipping subscription ${subscription.id} - no email`);
          results.skipped++;
          continue;
        }

        // Check if user already reviewed this subscription recently
        if (subscription.reviews.length > 0) {
          const lastReview = subscription.reviews[0];
          const daysSinceLastReview = Math.floor(
            (Date.now() - lastReview.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );

          // If they reviewed within the last 30 days, skip
          if (daysSinceLastReview < 30) {
            console.log(
              `[cron:review-reminders-subscription] Skipping subscription ${subscription.id} - reviewed ${daysSinceLastReview} days ago`
            );
            results.skipped++;
            continue;
          }
        }

        const subscriptionStartDate = format(subscription.createdAt, "MMMM yyyy");

        // Send email (reusing the review reminder function)
        const result = await sendReviewReminder({
          to: subscription.user.email,
          studentName: subscription.user.name || "there",
          mentorName: subscription.mentor.name || "your mentor",
          sessionDate: `Subscription started ${subscriptionStartDate}`,
          sessionTime: "N/A", // Not applicable for Subscriptions
          bookingId: subscription.id, // Using subscription ID as bookingId for email template
        });

        if (result.ok) {
          // Mark reminder as sent
          await db.userSubscription.update({
            where: { id: subscription.id },
            data: { lastReviewReminderSentAt: now },
          });

          // Create in-app notification
          await db.notification.create({
            data: {
              userId: subscription.userId,
              type: "SUBSCRIPTION_UPDATE",
              title: "Share your feedback!",
              message: `How are you enjoying ${subscription.mentor.name}'s ${subscription.plan.name}? Share your experience!`,
              link: `/subscriptions/${subscription.id}/review`,
            },
          });

          results.sent++;
          console.log(`[cron:review-reminders-subscription] ✓ Sent reminder for subscription ${subscription.id}`);
        } else {
          results.failed++;
          results.errors.push(`Subscription ${subscription.id}: ${result.error}`);
          console.error(`[cron:review-reminders-subscription] ✗ Failed for subscription ${subscription.id}`, result.error);
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Subscription ${subscription.id}: ${errorMessage}`);
        console.error(`[cron:review-reminders-subscription] Exception for subscription ${subscription.id}:`, error);
      }
    }

    console.log(
      `[cron:review-reminders-subscription] Job complete. Sent: ${results.sent}, Failed: ${results.failed}, Skipped: ${results.skipped}`
    );

    return NextResponse.json({
      ok: true,
      data: {
        timestamp: now.toISOString(),
        subscriptionsProcessed: activeSubscriptions.length,
        sent: results.sent,
        failed: results.failed,
        skipped: results.skipped,
        errors: results.errors,
      },
    });
  } catch (err) {
    console.error("[cron:review-reminders-subscription] Job failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
