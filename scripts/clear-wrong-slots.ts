// scripts/clear-wrong-slots.ts
import { db } from "../lib/db";

async function clearSlots() {
  console.log("=== CLEARING INCORRECT AVAILABLE SLOTS ===\n");

  const mentor = await db.mentor.findFirst({
    where: {
      user: { email: "devannaastad@gmail.com" }
    }
  });

  if (!mentor) {
    console.log("❌ Mentor profile not found");
    return;
  }

  const deleteResult = await db.availableSlot.deleteMany({
    where: { mentorId: mentor.id }
  });

  console.log(`✅ Deleted ${deleteResult.count} incorrect available slots`);
  console.log("\nYour availability calendar is now clear.");
  console.log("Please re-create your availability with the correct Mountain Time timezone.");
}

clearSlots()
  .then(() => {
    console.log("\n✅ Complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
