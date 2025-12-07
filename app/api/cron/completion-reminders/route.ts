// app/api/cron/completion-reminders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { format, subHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const runtime = "nodejs";

/**
 * GET /api/cron/completion-reminders
 * Sends in-app notifications for students to complete sessions (after session ends)
 *
 * This endpoint should be called every 30 minutes by a cron job
 * Authorization: Requires CRON_SECRET to match environment variable
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find sessions that ended 30 minutes to 2 hours ago
    // (checking sessions that just ended recently)
    const windowStart = subHours(now, 2); // 2 hours ago
    const windowEnd = subHours(now, 0.5); // 30 minutes ago

    const completedSessions = await db.booking.findMany({
      where: {
        type: "SESSION",
        status: "CONFIRMED",
        scheduledAt: {
          gte: windowStart,
          lte: windowEnd,
        },
        // Haven't sent completion reminder yet
        completionReminderSentAt: null,
      },
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
            name: true,
            email: true,
            timezone: true,
          },
        },
      },
    });

    console.log(`[cron:completion-reminders] Found ${completedSessions.length} sessions needing completion reminders`);

    const results = {
      sent: 0,
      failed: 0,
    };

    for (const booking of completedSessions) {
      try {
        // Check if session time + duration has passed
        const sessionEndTime = new Date(booking.scheduledAt!);
        sessionEndTime.setMinutes(sessionEndTime.getMinutes() + (booking.durationMinutes || 60));

        // If session hasn't ended yet, skip
        if (sessionEndTime > now) {
          continue;
        }

        // Convert time to student's timezone
        const studentTimezone = booking.user.timezone || "America/New_York";
        const studentSessionTime = toZonedTime(booking.scheduledAt!, studentTimezone);
        const sessionTime = format(studentSessionTime, "h:mm a");

        // Create in-app notification for student to complete session (using student's timezone)
        await db.notification.create({
          data: {
            userId: booking.userId,
            type: "SESSION_COMPLETION_REMINDER",
            title: "Complete your session",
            message: `Please mark your session with ${booking.mentor.name} at ${sessionTime} as complete`,
            link: `/bookings/${booking.id}/complete`,
            bookingId: booking.id,
          },
        });

        // Mark completion reminder as sent
        await db.booking.update({
          where: { id: booking.id },
          data: { completionReminderSentAt: now },
        });

        results.sent++;
      } catch (error) {
        console.error(`[cron:completion-reminders] Failed for booking ${booking.id}:`, error);
        results.failed++;
      }
    }

    console.log(`[cron:completion-reminders] Results:`, results);

    return NextResponse.json({
      ok: true,
      data: {
        checked: completedSessions.length,
        ...results,
      },
    });
  } catch (error) {
    console.error("[cron:completion-reminders] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process completion reminders" },
      { status: 500 }
    );
  }
}
