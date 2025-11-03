// scripts/mark-booking-completed.ts
// Usage: npx tsx scripts/mark-booking-completed.ts <bookingId>
// This script marks a booking as completed by the mentor for testing confirmation flow

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function markBookingCompleted(bookingId: string) {
  try {
    // Get the booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        mentor: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!booking) {
      console.error("❌ Booking not found:", bookingId);
      return;
    }

    console.log("\n📋 Booking Details:");
    console.log("   Student:", booking.user.name || booking.user.email);
    console.log("   Mentor:", booking.mentor.name);
    console.log("   Status:", booking.status);
    console.log("   Scheduled:", booking.scheduledAt?.toLocaleString() || "N/A");

    // Mark as completed by mentor
    const now = new Date();
    const autoConfirmAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "COMPLETED", // Set to COMPLETED so student can confirm
        mentorCompletedAt: now,
        autoConfirmAt: autoConfirmAt,
      },
    });

    console.log("\n✅ Booking marked as completed by mentor!");
    console.log("   Completed At:", updated.mentorCompletedAt?.toLocaleString());
    console.log("   Auto-confirm At:", updated.autoConfirmAt?.toLocaleString());
    console.log("\n💡 The student will now see a confirmation prompt on their dashboard.");
    console.log("   They have 48 hours to confirm or report an issue.");
    console.log("\n🔗 Test as student at: http://localhost:3000/dashboard");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.$disconnect();
  }
}

// Get booking ID from command line
const bookingId = process.argv[2];

if (!bookingId) {
  console.error("❌ Please provide a booking ID");
  console.log("\nUsage: npx tsx scripts/mark-booking-completed.ts <bookingId>");
  console.log("\nTo find booking IDs, check your database or use:");
  console.log("  npx tsx scripts/list-bookings.ts");
  process.exit(1);
}

markBookingCompleted(bookingId);
