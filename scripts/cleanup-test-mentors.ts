// scripts/cleanup-test-mentors.ts
import { db } from "../lib/db";

async function cleanupTestMentors() {
  console.log("=== CLEANING UP TEST MENTOR ACCOUNTS ===\n");

  // Find all mentor accounts for devannaastad@gmail.com
  const mentors = await db.mentor.findMany({
    where: {
      user: { email: "devannaastad@gmail.com" }
    },
    include: {
      user: { select: { email: true, name: true } },
      _count: {
        select: {
          availability: true,
          bookings: true,
        }
      }
    }
  });

  console.log(`Found ${mentors.length} mentor profiles for devannaastad@gmail.com:\n`);

  mentors.forEach((mentor, idx) => {
    console.log(`${idx + 1}. ${mentor.name}`);
    console.log(`   Stripe Connect ID: ${mentor.stripeConnectId || "None"}`);
    console.log(`   Stripe Onboarded: ${mentor.stripeOnboarded}`);
    console.log(`   Availability slots: ${mentor._count.availability}`);
    console.log(`   Bookings: ${mentor._count.bookings}`);
    console.log(`   ID: ${mentor.id}`);
    console.log();
  });

  console.log("\n⚠️  To delete specific mentor accounts, update this script with the IDs you want to keep/delete.");
  console.log("⚠️  This is a DRY RUN - no data has been deleted yet.\n");

  // Uncomment below to actually delete (add the mentor IDs you want to DELETE)
  /*
  const mentorIdsToDelete = [
    "mentor_id_1_here",
    "mentor_id_2_here",
    "mentor_id_3_here",
  ];

  for (const mentorId of mentorIdsToDelete) {
    console.log(`Deleting mentor: ${mentorId}`);

    // Delete availability slots first
    await db.availableSlot.deleteMany({
      where: { mentorId }
    });

    // Delete the mentor profile
    await db.mentor.delete({
      where: { id: mentorId }
    });

    console.log(`✅ Deleted mentor: ${mentorId}`);
  }
  */
}

cleanupTestMentors()
  .then(() => {
    console.log("\n✅ Complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
