import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating mentor prices to cents and adding profile images...");

  // Update all mentors - multiply prices by 100 to convert to cents
  const mentors = await prisma.mentor.findMany();

  for (const mentor of mentors) {
    const updates: any = {};

    // Convert hourly rate to cents if it exists and is less than 1000 (indicating it's in dollars)
    if (mentor.hourlyRate && mentor.hourlyRate < 1000) {
      updates.hourlyRate = mentor.hourlyRate * 100;
    }

    // Convert access price to cents if it exists and is less than 1000 (indicating it's in dollars)
    if (mentor.accessPrice && mentor.accessPrice < 1000) {
      updates.accessPrice = mentor.accessPrice * 100;
    }

    // Add a profile image URL (using UI Avatars service)
    if (!mentor.profileImage) {
      const initials = mentor.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      updates.profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        mentor.name
      )}&size=200&background=random&color=fff&bold=true`;
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      await prisma.mentor.update({
        where: { id: mentor.id },
        data: updates,
      });
      console.log(
        `✅ Updated ${mentor.name}: hourly=${updates.hourlyRate || mentor.hourlyRate}, access=${updates.accessPrice || mentor.accessPrice}`
      );
    }
  }

  console.log("\n✅ All mentors updated!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
