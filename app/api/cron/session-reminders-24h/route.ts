// app/api/cron/session-reminders-24h/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSessionReminder } from "@/lib/email";
import { format, addHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const runtime = "nodejs";

/**
 * GET /api/cron/session-reminders-24h
 * Sends email and in-app notifications for sessions starting in 24 hours
 *
 * This endpoint should be called every hour by a cron job
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

    // Find sessions starting in 23-25 hours (24 hour window with buffer)
    const now = new Date();
    const reminderWindowStart = addHours(now, 23); // 23 hours from now
    const reminderWindowEnd = addHours(now, 25); // 25 hours from now

    const upcomingSessions = await db.booking.findMany({
      where: {
        type: "SESSION",
        status: "CONFIRMED",
        scheduledAt: {
          gte: reminderWindowStart,
          lte: reminderWindowEnd,
        },
        // Don't send duplicate reminders
        reminder24hSentAt: null,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            userId: true,
            timezone: true,
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

    console.log(`[cron:session-reminders-24h] Found ${upcomingSessions.length} sessions needing 24h reminders`);

    const results = {
      sent: 0,
      failed: 0,
      notifications: 0,
    };

    for (const booking of upcomingSessions) {
      try {
        // Skip if user doesn't have an email
        if (!booking.user.email) {
          console.log(`[cron:session-reminders-24h] Skipping booking ${booking.id} - no student email`);
          continue;
        }

        const durationMinutes = booking.durationMinutes || 60;

        // Convert times to user timezones
        const studentTimezone = booking.user.timezone || "America/New_York";
        const mentorTimezone = booking.mentor.timezone || "America/New_York";

        const studentSessionTime = toZonedTime(booking.scheduledAt!, studentTimezone);
        const mentorSessionTime = toZonedTime(booking.scheduledAt!, mentorTimezone);

        const studentSessionTimeStr = format(studentSessionTime, "h:mm a");
        const mentorSessionTimeStr = format(mentorSessionTime, "h:mm a");

        const sessionDate = format(booking.scheduledAt!, "EEEE, MMMM d, yyyy");

        // Send email to student (using student's timezone)
        await sendSessionReminder({
          to: booking.user.email,
          recipientName: booking.user.name || "there",
          mentorName: booking.mentor.name,
          studentName: booking.user.name || booking.user.email,
          sessionDate,
          sessionTime: studentSessionTimeStr,
          durationMinutes,
          meetingLink: booking.meetingLink || undefined,
          bookingId: booking.id,
          isMentor: false,
        });

        // Send email to mentor (get mentor's email, using mentor's timezone)
        const mentorUser = await db.user.findUnique({
          where: { id: booking.mentor.userId },
          select: { email: true, name: true },
        });

        if (mentorUser?.email) {
          await sendSessionReminder({
            to: mentorUser.email,
            recipientName: mentorUser.name || "there",
            mentorName: booking.mentor.name,
            studentName: booking.user.name || booking.user.email,
            sessionDate,
            sessionTime: mentorSessionTimeStr,
            durationMinutes,
            meetingLink: booking.meetingLink || undefined,
            bookingId: booking.id,
            isMentor: true,
          });
        }

        // Create in-app notifications (each with their own timezone)
        await db.notification.createMany({
          data: [
            // Student notification (using student's timezone)
            {
              userId: booking.userId,
              type: "SESSION_REMINDER_24H",
              title: "Session tomorrow!",
              message: `Your session with ${booking.mentor.name} is tomorrow at ${studentSessionTimeStr}`,
              link: `/bookings/${booking.id}/confirm`,
              bookingId: booking.id,
            },
            // Mentor notification (using mentor's timezone)
            {
              userId: booking.mentor.userId,
              type: "SESSION_REMINDER_24H",
              title: "Session tomorrow!",
              message: `Your session with ${booking.user.name || "a student"} is tomorrow at ${mentorSessionTimeStr}`,
              link: `/mentor-dashboard`,
              bookingId: booking.id,
            },
          ],
        });

        // Mark reminder as sent
        await db.booking.update({
          where: { id: booking.id },
          data: { reminder24hSentAt: now },
        });

        results.sent++;
        results.notifications += 2;
      } catch (error) {
        console.error(`[cron:session-reminders-24h] Failed for booking ${booking.id}:`, error);
        results.failed++;
      }
    }

    console.log(`[cron:session-reminders-24h] Results:`, results);

    return NextResponse.json({
      ok: true,
      data: {
        checked: upcomingSessions.length,
        ...results,
      },
    });
  } catch (error) {
    console.error("[cron:session-reminders-24h] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process 24h session reminders" },
      { status: 500 }
    );
  }
}
