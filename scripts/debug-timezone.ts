// scripts/debug-timezone.ts
import { db } from "../lib/db";

async function debugTimezones() {
  console.log("=== MENTOR TIMEZONE DEBUG ===\n");

  // Get your mentor profile
  const mentor = await db.mentor.findFirst({
    where: {
      user: { email: "devannaastad@gmail.com" }
    },
    include: {
      user: { select: { email: true, name: true } },
      availability: { take: 5 },
    }
  });

  if (!mentor) {
    console.log("❌ Mentor profile not found");
    return;
  }

  console.log("📍 Mentor Profile:");
  console.log(`  Name: ${mentor.name}`);
  console.log(`  Email: ${mentor.user.email}`);
  console.log(`  Timezone: ${mentor.timezone || "NOT SET"}`);
  console.log();

  console.log("📅 Availability Records:");
  if (mentor.availability.length === 0) {
    console.log("  No availability records found");
  } else {
    mentor.availability.forEach((avail) => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      console.log(`  ${days[avail.dayOfWeek]}: ${avail.startTime} - ${avail.endTime}`);
      console.log(`    Timezone: ${avail.timezone || "NOT SET"}`);
      console.log(`    Active: ${avail.isActive}`);
    });
  }
  console.log();

  // Get available slots
  const slots = await db.availableSlot.findMany({
    where: { mentorId: mentor.id },
    orderBy: { startTime: "asc" },
    take: 10,
  });

  console.log("🕒 Generated Available Slots (first 10):");
  if (slots.length === 0) {
    console.log("  No slots generated yet");
  } else {
    slots.forEach((slot) => {
      const localTime = slot.startTime.toLocaleString("en-US", { timeZone: mentor.timezone || "America/Denver" });
      const utcTime = slot.startTime.toISOString();
      console.log(`  ${localTime} (UTC: ${utcTime})`);
      console.log(`    Free: ${slot.isFreeSession}`);
    });
  }
}

debugTimezones()
  .then(() => {
    console.log("\n✅ Debug complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
