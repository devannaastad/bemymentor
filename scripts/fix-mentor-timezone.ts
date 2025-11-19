// scripts/fix-mentor-timezone.ts
import { db } from "../lib/db";

async function fixTimezone() {
  console.log("=== FIXING MENTOR TIMEZONE ===\n");

  const mentor = await db.mentor.findFirst({
    where: {
      user: { email: "devannaastad@gmail.com" }
    },
    include: {
      user: { select: { email: true, name: true } }
    }
  });

  if (!mentor) {
    console.log("❌ Mentor profile not found");
    return;
  }

  console.log(`📍 Current timezone: ${mentor.timezone}`);
  console.log(`📍 Updating to: America/Denver (Mountain Time)\n`);

  await db.mentor.update({
    where: { id: mentor.id },
    data: { timezone: "America/Denver" }
  });

  console.log("✅ Timezone updated!");
  console.log("\nNext steps:");
  console.log("1. Go to your Mentor Dashboard");
  console.log("2. Re-create your availability slots with the correct timezone");
  console.log("3. Delete any existing slots that have the wrong times");
}

fixTimezone()
  .then(() => {
    console.log("\n✅ Complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
