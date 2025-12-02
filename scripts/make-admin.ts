import { db } from "@/lib/db";

/**
 * Script to update a user's role to ADMIN
 * Usage: npx tsx scripts/make-admin.ts <email>
 * Example: npx tsx scripts/make-admin.ts user@example.com
 */

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Error: Please provide an email address");
    console.log("Usage: npx tsx scripts/make-admin.ts <email>");
    console.log("Example: npx tsx scripts/make-admin.ts user@example.com");
    process.exit(1);
  }

  // Find the user
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    console.error(`❌ Error: User with email "${email}" not found`);
    process.exit(1);
  }

  console.log("\n📋 Current user details:");
  console.log(`  Name: ${user.name || "N/A"}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Current Role: ${user.role}`);

  if (user.role === "ADMIN") {
    console.log("\n✅ User is already an ADMIN");
    process.exit(0);
  }

  // Update to ADMIN
  const updatedUser = await db.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: {
      email: true,
      name: true,
      role: true,
    },
  });

  console.log("\n✅ Successfully updated user to ADMIN");
  console.log(`  Name: ${updatedUser.name || "N/A"}`);
  console.log(`  Email: ${updatedUser.email}`);
  console.log(`  New Role: ${updatedUser.role}`);
  console.log("\n🎉 Done! User can now access admin features.\n");
}

main()
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
