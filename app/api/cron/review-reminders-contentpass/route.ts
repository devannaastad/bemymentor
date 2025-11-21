// app/api/cron/review-reminders-contentpass/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendReviewReminder } from "@/lib/email";
import { format, subHours } from "date-fns";

export const runtime = "nodejs";

/**
 * GET /api/cron/review-reminders-contentpass
 * Send review reminders for Content Pass purchases (24 hours after purchase)
 * Run this every hour via cron
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error("[cron:review-reminders-contentpass] Unauthorized");
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    console.log("[cron:review-reminders-contentpass] Starting review reminder job");

    const now = new Date();

    // Find Content Pass purchases that:
    // 1. Were purchased 23-25 hours ago (1 day window)
    // 2. Don't have a review yet
    // 3. Haven't had a review reminder sent
    const reminderWindowStart = subHours(now, 25); // 25 hours ago
    const reminderWindowEnd = subHours(now, 23); // 23 hours ago

    const contentPassPurchases = await db.booking.findMany({
      where: {
        type: "ACCESS",
        status: "CONFIRMED",
        createdAt: {
          gte: reminderWindowStart,
          lte: reminderWindowEnd,
        },
        reviewReminderSentAt: null, // Haven't sent reminder yet
        review: null, // No review yet
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
      },
    });

    console.log(
      `[cron:review-reminders-contentpass] Found ${contentPassPurchases.length} purchases needing review reminders`
    );

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const booking of contentPassPurchases) {
      try {
        // Skip if no email
        if (!booking.user.email) {
          console.log(`[cron:review-reminders-contentpass] Skipping booking ${booking.id} - no email`);
          continue;
        }

        const purchaseDate = format(booking.createdAt, "EEEE, MMMM d, yyyy");

        // Send email (reusing the review reminder function)
        const result = await sendReviewReminder({
          to: booking.user.email,
          studentName: booking.user.name || "there",
          mentorName: booking.mentor.name || "your mentor",
          sessionDate: purchaseDate,
          sessionTime: "N/A", // Not applicable for Content Pass
          bookingId: booking.id,
        });

        if (result.ok) {
          // Mark reminder as sent
          await db.booking.update({
            where: { id: booking.id },
            data: { reviewReminderSentAt: now },
          });

          // Create in-app notification
          await db.notification.create({
            data: {
              userId: booking.userId,
              bookingId: booking.id,
              type: "BOOKING_UPDATE",
              title: "How's the content?",
              message: `Share your experience with ${booking.mentor.name}'s content pass and help other learners!`,
              link: `/bookings/${booking.id}/review`,
            },
          });

          results.sent++;
          console.log(`[cron:review-reminders-contentpass] ✓ Sent reminder for booking ${booking.id}`);
        } else {
          results.failed++;
          results.errors.push(`Booking ${booking.id}: ${result.error}`);
          console.error(`[cron:review-reminders-contentpass] ✗ Failed for booking ${booking.id}`, result.error);
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Booking ${booking.id}: ${errorMessage}`);
        console.error(`[cron:review-reminders-contentpass] Exception for booking ${booking.id}:`, error);
      }
    }

    console.log(`[cron:review-reminders-contentpass] Job complete. Sent: ${results.sent}, Failed: ${results.failed}`);

    return NextResponse.json({
      ok: true,
      data: {
        timestamp: now.toISOString(),
        purchasesProcessed: contentPassPurchases.length,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors,
      },
    });
  } catch (err) {
    console.error("[cron:review-reminders-contentpass] Job failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
