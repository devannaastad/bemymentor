import { db } from "@/lib/db";

/**
 * Script to check mentor categories
 * Usage: npx tsx scripts/check-mentor-categories.ts
 */

async function main() {
  const mentors = await db.mentor.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      category: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  console.log("\n📋 Active Mentors and their Categories:\n");

  if (mentors.length === 0) {
    console.log("No active mentors found.\n");
    return;
  }

  mentors.forEach((mentor) => {
    console.log(`  Name: ${mentor.name}`);
    console.log(`  Email: ${mentor.user.email}`);
    console.log(`  Category: ${mentor.category}`);
    console.log(`  ID: ${mentor.id}`);
    console.log("");
  });

  console.log(`Total active mentors: ${mentors.length}\n`);
}

main()
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
