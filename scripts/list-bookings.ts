// scripts/list-bookings.ts
// Lists all bookings to find IDs for testing

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function listBookings() {
  try {
    const bookings = await db.booking.findMany({
      include: {
        mentor: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (bookings.length === 0) {
      console.log("No bookings found.");
      return;
    }

    console.log("\n📋 Recent Bookings:\n");
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. Booking ID: ${booking.id}`);
      console.log(`   Student: ${booking.user.name || booking.user.email}`);
      console.log(`   Mentor: ${booking.mentor.name}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Type: ${booking.type}`);
      console.log(`   Scheduled: ${booking.scheduledAt?.toLocaleString() || "N/A"}`);
      console.log(`   Mentor Completed: ${booking.mentorCompletedAt ? "✅ Yes" : "❌ No"}`);
      console.log(`   Student Confirmed: ${booking.studentConfirmedAt ? "✅ Yes" : "❌ No"}`);
      console.log("");
    });

    console.log("\n💡 To mark a booking as completed for testing:");
    console.log("   npx tsx scripts/mark-booking-completed.ts <bookingId>");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await db.$disconnect();
  }
}

listBookings();
