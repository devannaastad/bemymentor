import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function checkMentorSettings() {
  try {
    // Get all mentors
    const mentors = await db.mentor.findMany({
      select: {
        id: true,
        name: true,
        timezone: true,
        meetingPlatform: true,
        customMeetingLink: true,
        autoGenerateMeetingLinks: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log("\n📋 Mentor Settings:\n");

    for (const mentor of mentors) {
      console.log(`Mentor: ${mentor.name}`);
      console.log(`  Email: ${mentor.user.email}`);
      console.log(`  Timezone: ${mentor.timezone}`);
      console.log(`  Auto-generate links: ${mentor.autoGenerateMeetingLinks}`);
      console.log(`  Meeting platform: ${mentor.meetingPlatform}`);
      console.log(`  Custom link: ${mentor.customMeetingLink || "N/A"}`);
      console.log("");
    }

    // Get recent bookings
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        meetingLink: true,
        scheduledAt: true,
        createdAt: true,
        mentor: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log("\n📅 Recent Bookings:\n");

    for (const booking of recentBookings) {
      console.log(`Booking ID: ${booking.id}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Mentor: ${booking.mentor.name}`);
      console.log(`  Student: ${booking.user.name}`);
      console.log(`  Meeting Link: ${booking.meetingLink || "❌ NOT SET"}`);
      console.log(`  Created: ${booking.createdAt}`);
      console.log("");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.$disconnect();
  }
}

checkMentorSettings();
