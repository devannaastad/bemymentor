// scripts/remove-test-mentors.ts
import { db } from "../lib/db";

async function removeTestMentors() {
  try {
    console.log("Fetching all mentors...");

    // Get all mentors with their user info
    const mentors = await db.mentor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`\nFound ${mentors.length} mentors:\n`);

    mentors.forEach((mentor, index) => {
      console.log(`${index + 1}. ${mentor.user.name} (${mentor.user.email})`);
      console.log(`   Title: ${mentor.title}`);
      console.log(`   ID: ${mentor.id}`);
      console.log("");
    });

    // Define test mentor patterns (emails or names that are clearly test data)
    const testPatterns = [
      "john.doe@example.com",
      "jane.smith@example.com",
      "alex.johnson@example.com",
      "sarah.wilson@example.com",
      "test",
      "demo",
      "example",
      "@seed.internal", // Seed data from database seeding
    ];

    // Find test mentors
    const testMentors = mentors.filter((mentor) => {
      const email = mentor.user.email?.toLowerCase() || "";
      const name = mentor.user.name?.toLowerCase() || "";

      return testPatterns.some(
        (pattern) => email.includes(pattern) || name.includes(pattern)
      );
    });

    if (testMentors.length === 0) {
      console.log("✅ No test mentors found to remove.");
      return;
    }

    console.log(`\n🔍 Found ${testMentors.length} test mentor(s) to remove:\n`);

    testMentors.forEach((mentor) => {
      console.log(`- ${mentor.user.name} (${mentor.user.email})`);
    });

    console.log("\n🗑️  Removing test mentors...\n");

    // Delete mentor profiles and associated data
    for (const mentor of testMentors) {
      console.log(`Deleting ${mentor.user.name}...`);

      // Delete related data first
      await db.availability.deleteMany({
        where: { mentorId: mentor.id },
      });

      await db.blockedSlot.deleteMany({
        where: { mentorId: mentor.id },
      });

      await db.review.deleteMany({
        where: { mentorId: mentor.id },
      });

      await db.booking.deleteMany({
        where: { mentorId: mentor.id },
      });

      await db.savedMentor.deleteMany({
        where: { mentorId: mentor.id },
      });

      // Delete mentor profile
      await db.mentor.delete({
        where: { id: mentor.id },
      });

      // Optionally delete the user account too (if they're test users)
      // Uncomment if you want to delete the user accounts as well
      // await db.user.delete({
      //   where: { id: mentor.user.id },
      // });

      console.log(`✅ Deleted ${mentor.user.name}`);
    }

    console.log(`\n✅ Successfully removed ${testMentors.length} test mentor(s)!`);
  } catch (error) {
    console.error("❌ Error removing test mentors:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

removeTestMentors();
