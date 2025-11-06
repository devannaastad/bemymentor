import { PrismaClient } from "@prisma/client";
import { sendReviewReminder } from "../lib/email";
import { format } from "date-fns";

const db = new PrismaClient();

async function testReviewReminder(bookingId: string) {
  try {
    console.log(`\n🔍 Looking up booking: ${bookingId}`);

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        mentor: true,
        review: true,
      },
    });

    if (!booking) {
      console.error("❌ Booking not found");
      process.exit(1);
    }

    console.log(`\n📋 Booking Details:`);
    console.log(`   Student: ${booking.user.name}`);
    console.log(`   Mentor: ${booking.mentor.name}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Has Review: ${booking.review ? "Yes" : "No"}`);
    console.log(`   Review Reminder Sent: ${booking.reviewReminderSentAt ? "Yes" : "No"}`);

    if (!booking.user.email) {
      console.error("❌ Student has no email address");
      process.exit(1);
    }

    if (!booking.scheduledAt) {
      console.error("❌ Booking has no scheduled time");
      process.exit(1);
    }

    if (booking.review) {
      console.log("\n⚠️  Warning: This booking already has a review");
    }

    if (booking.reviewReminderSentAt) {
      console.log("\n⚠️  Warning: Review reminder was already sent");
    }

    const sessionDate = format(booking.scheduledAt, "EEEE, MMMM d, yyyy");
    const sessionTime = format(booking.scheduledAt, "h:mm a");

    console.log(`\n📧 Sending review reminder email...`);

    const result = await sendReviewReminder({
      to: booking.user.email,
      studentName: booking.user.name || "there",
      mentorName: booking.mentor.name || "your mentor",
      sessionDate,
      sessionTime,
      bookingId: booking.id,
    });

    if (result.ok) {
      console.log(`   ✅ Email sent successfully to ${booking.user.email}`);

      // Mark as sent
      await db.booking.update({
        where: { id: booking.id },
        data: { reviewReminderSentAt: new Date() },
      });

      // Create notification
      await db.notification.create({
        data: {
          userId: booking.userId,
          bookingId: booking.id,
          type: "BOOKING_UPDATE",
          title: "How was your session?",
          message: `Share your experience with ${booking.mentor.name || "your mentor"} and help other learners!`,
          link: `/bookings/${booking.id}/review`,
        },
      });

      console.log(`   ✅ Marked reviewReminderSentAt timestamp`);
      console.log(`   ✅ Created in-app notification`);

      console.log(`\n✅ Test complete! Check:`);
      console.log(`   1. Email inbox for review reminder email`);
      console.log(`   2. Notification bell in the app`);
      console.log(`   3. Review URL: http://localhost:3000/bookings/${booking.id}/review`);
    } else {
      console.log(`   ❌ Failed to send email`);
      console.error("Error:", result.error);
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

const bookingId = process.argv[2];
if (!bookingId) {
  console.error("❌ Please provide a booking ID");
  console.log("\nUsage: npx tsx scripts/test-review-reminder.ts <bookingId>");
  process.exit(1);
}

testReviewReminder(bookingId);
