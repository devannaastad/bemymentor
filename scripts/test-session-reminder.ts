import { PrismaClient } from "@prisma/client";
import { sendSessionReminder } from "../lib/email";
import { format } from "date-fns";

const db = new PrismaClient();

async function testSessionReminder(bookingId: string) {
  try {
    console.log(`🔍 Looking up booking: ${bookingId}`);

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        mentor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking) {
      console.error("❌ Booking not found");
      process.exit(1);
    }

    if (!booking.scheduledAt) {
      console.error("❌ Booking has no scheduled time");
      process.exit(1);
    }

    console.log(`\n📅 Booking Details:`);
    console.log(`   Student: ${booking.user.name}`);
    console.log(`   Mentor: ${booking.mentor.name}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Scheduled: ${format(booking.scheduledAt, "PPpp")}`);
    console.log(`   Duration: ${booking.durationMinutes} minutes`);

    const sessionDate = format(booking.scheduledAt, "EEEE, MMMM d, yyyy");
    const sessionTime = format(booking.scheduledAt, "h:mm a");
    const mentorUser = booking.mentor.user;

    console.log(`\n📧 Sending reminder emails...`);

    // Send email to student
    const studentEmail = await sendSessionReminder({
      to: booking.user.email!,
      recipientName: booking.user.name || "Student",
      mentorName: booking.mentor.name || "Your mentor",
      studentName: booking.user.name || "Student",
      sessionDate,
      sessionTime,
      durationMinutes: booking.durationMinutes || 60,
      meetingLink: booking.meetingLink || undefined,
      bookingId: booking.id,
      isMentor: false,
    });

    if (studentEmail.ok) {
      console.log(`   ✅ Student email sent to ${booking.user.email}`);
    } else {
      console.log(`   ❌ Failed to send student email`);
    }

    // Send email to mentor
    const mentorEmail = await sendSessionReminder({
      to: mentorUser.email!,
      recipientName: booking.mentor.name || "Mentor",
      mentorName: booking.mentor.name || "Mentor",
      studentName: booking.user.name || "Student",
      sessionDate,
      sessionTime,
      durationMinutes: booking.durationMinutes || 60,
      meetingLink: booking.meetingLink || undefined,
      bookingId: booking.id,
      isMentor: true,
    });

    if (mentorEmail.ok) {
      console.log(`   ✅ Mentor email sent to ${mentorUser.email}`);
    } else {
      console.log(`   ❌ Failed to send mentor email`);
    }

    console.log(`\n🔔 Creating in-app notifications...`);

    // Create in-app notifications
    const notifications = await db.notification.createMany({
      data: [
        {
          userId: booking.userId,
          bookingId: booking.id,
          type: "SESSION_REMINDER",
          title: "Session starting soon!",
          message: `Your session with ${booking.mentor.name} starts in 1 hour`,
          link: `/bookings/${booking.id}`,
        },
        {
          userId: booking.mentor.userId,
          bookingId: booking.id,
          type: "SESSION_REMINDER",
          title: "Session starting soon!",
          message: `Your session with ${booking.user.name || "a student"} starts in 1 hour`,
          link: `/mentor-dashboard`,
        },
      ],
    });

    console.log(`   ✅ Created ${notifications.count} notifications`);

    // Mark reminder as sent
    await db.booking.update({
      where: { id: booking.id },
      data: { reminderSentAt: new Date() },
    });

    console.log(`   ✅ Marked reminderSentAt timestamp`);

    console.log(`\n✅ Test complete! Check:`);
    console.log(`   1. Your email inbox for reminder emails`);
    console.log(`   2. The notification bell icon in the app`);
    console.log(`   3. Student dashboard: http://localhost:3000/dashboard`);
    console.log(`   4. Mentor dashboard: http://localhost:3000/mentor-dashboard`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

const bookingId = process.argv[2];
if (!bookingId) {
  console.error("❌ Please provide a booking ID");
  console.log("\nUsage: npx tsx scripts/test-session-reminder.ts <bookingId>");
  process.exit(1);
}

testSessionReminder(bookingId);
