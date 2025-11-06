import { PrismaClient } from "@prisma/client";
import { autoGenerateMeetingLink } from "../lib/meeting-links";

const db = new PrismaClient();

async function addMeetingLinkToBooking(bookingId: string) {
  try {
    console.log(`\n🔗 Adding meeting link to booking: ${bookingId}`);

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            autoGenerateMeetingLinks: true,
            meetingPlatform: true,
            customMeetingLink: true,
          },
        },
      },
    });

    if (!booking) {
      console.error("❌ Booking not found");
      process.exit(1);
    }

    console.log(`\nBooking details:`);
    console.log(`  Mentor: ${booking.mentor.name}`);
    console.log(`  Status: ${booking.status}`);
    console.log(`  Current meeting link: ${booking.meetingLink || "NOT SET"}`);
    console.log(`\nMentor settings:`);
    console.log(`  Auto-generate: ${booking.mentor.autoGenerateMeetingLinks}`);
    console.log(`  Platform: ${booking.mentor.meetingPlatform}`);
    console.log(`  Custom link: ${booking.mentor.customMeetingLink || "N/A"}`);

    if (!booking.mentor.autoGenerateMeetingLinks) {
      console.log("\n⚠️  Auto-generate is disabled for this mentor");
      process.exit(0);
    }

    let meetingLink: string;

    if (booking.mentor.meetingPlatform === "custom" && booking.mentor.customMeetingLink) {
      meetingLink = booking.mentor.customMeetingLink;
      console.log(`\n✅ Using custom meeting link: ${meetingLink}`);
    } else {
      const platform = booking.mentor.meetingPlatform as "google" | "zoom" | "generic";
      meetingLink = autoGenerateMeetingLink(bookingId, platform);
      console.log(`\n✅ Generated ${platform} meeting link: ${meetingLink}`);
    }

    // Update the booking
    await db.booking.update({
      where: { id: bookingId },
      data: { meetingLink },
    });

    console.log("\n✅ Meeting link added to booking!");
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
  console.log("\nUsage: npx tsx scripts/add-meeting-link.ts <bookingId>");
  process.exit(1);
}

addMeetingLinkToBooking(bookingId);
