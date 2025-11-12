// app/api/cron/session-reminders-15min/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendSessionReminder } from "@/lib/email";
import { format, addMinutes } from "date-fns";

export const runtime = "nodejs";

/**
 * GET /api/cron/session-reminders-15min
 * Sends email and in-app notifications for sessions starting in 15 minutes
 *
 * This endpoint should be called every 5 minutes by a cron job
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

    // Find sessions starting in 10-20 minutes (15 minute window with buffer)
    const now = new Date();
    const reminderWindowStart = addMinutes(now, 10); // 10 minutes from now
    const reminderWindowEnd = addMinutes(now, 20); // 20 minutes from now

    const upcomingSessions = await db.booking.findMany({
      where: {
        type: "SESSION",
        status: "CONFIRMED",
        scheduledAt: {
          gte: reminderWindowStart,
          lte: reminderWindowEnd,
        },
        // Don't send duplicate reminders
        reminder15minSentAt: null,
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
          },
        },
      },
    });

    console.log(`[cron:session-reminders-15min] Found ${upcomingSessions.length} sessions needing 15min reminders`);

    const results = {
      sent: 0,
      failed: 0,
      notifications: 0,
    };

    for (const booking of upcomingSessions) {
      try {
        // Skip if user doesn't have an email
        if (!booking.user.email) {
          console.log(`[cron:session-reminders-15min] Skipping booking ${booking.id} - no student email`);
          continue;
        }

        const sessionDate = format(booking.scheduledAt!, "EEEE, MMMM d, yyyy");
        const sessionTime = format(booking.scheduledAt!, "h:mm a");
        const durationMinutes = booking.durationMinutes || 60;

        // Send email to student
        await sendSessionReminder({
          to: booking.user.email,
          recipientName: booking.user.name || "there",
          mentorName: booking.mentor.name,
          studentName: booking.user.name || booking.user.email,
          sessionDate,
          sessionTime,
          durationMinutes,
          meetingLink: booking.meetingLink || undefined,
          bookingId: booking.id,
          isMentor: false,
        });

        // Send email to mentor (get mentor's email)
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
            sessionTime,
            durationMinutes,
            meetingLink: booking.meetingLink || undefined,
            bookingId: booking.id,
            isMentor: true,
          });
        }

        // Create in-app notifications
        await db.notification.createMany({
          data: [
            // Student notification
            {
              userId: booking.userId,
              type: "SESSION_REMINDER_15MIN",
              title: "Session starting soon!",
              message: `Your session with ${booking.mentor.name} starts in 15 minutes at ${sessionTime}`,
              link: `/bookings/${booking.id}/confirm`,
              bookingId: booking.id,
            },
            // Mentor notification
            {
              userId: booking.mentor.userId,
              type: "SESSION_REMINDER_15MIN",
              title: "Session starting soon!",
              message: `Your session with ${booking.user.name || "a student"} starts in 15 minutes at ${sessionTime}`,
              link: `/mentor-dashboard`,
              bookingId: booking.id,
            },
          ],
        });

        // Mark reminder as sent
        await db.booking.update({
          where: { id: booking.id },
          data: { reminder15minSentAt: now },
        });

        results.sent++;
        results.notifications += 2;
      } catch (error) {
        console.error(`[cron:session-reminders-15min] Failed for booking ${booking.id}:`, error);
        results.failed++;
      }
    }

    console.log(`[cron:session-reminders-15min] Results:`, results);

    return NextResponse.json({
      ok: true,
      data: {
        checked: upcomingSessions.length,
        ...results,
      },
    });
  } catch (error) {
    console.error("[cron:session-reminders-15min] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process 15min session reminders" },
      { status: 500 }
    );
  }
}
