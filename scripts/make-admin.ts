import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

/**
 * Script to add a user as admin by adding their email to lib/admin.ts
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

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`❌ Error: "${email}" is not a valid email address`);
    process.exit(1);
  }

  // Find the user in database
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    console.error(`❌ Error: User with email "${email}" not found in database`);
    process.exit(1);
  }

  console.log("\n📋 User found:");
  console.log(`  Name: ${user.name || "N/A"}`);
  console.log(`  Email: ${user.email}`);

  // Read the admin.ts file
  const adminFilePath = path.join(process.cwd(), "lib", "admin.ts");
  let adminFileContent = fs.readFileSync(adminFilePath, "utf-8");

  // Check if email already exists in ADMIN_EMAILS
  const adminEmailsMatch = adminFileContent.match(/const ADMIN_EMAILS = \[([\s\S]*?)\];/);

  if (!adminEmailsMatch) {
    console.error("❌ Error: Could not find ADMIN_EMAILS array in lib/admin.ts");
    process.exit(1);
  }

  const currentEmails = adminEmailsMatch[1];
  const emailToAdd = email.toLowerCase();

  // Check if already an admin
  if (currentEmails.includes(`"${emailToAdd}"`) || currentEmails.includes(`'${emailToAdd}'`)) {
    console.log(`\n✅ "${emailToAdd}" is already an admin`);
    process.exit(0);
  }

  // Add the new email to the array
  const newAdminEmails = `const ADMIN_EMAILS = [
  "devannaastad@gmail.com",
  "${emailToAdd}",
  // Add more admin emails here
];`;

  adminFileContent = adminFileContent.replace(/const ADMIN_EMAILS = \[[\s\S]*?\];/, newAdminEmails);

  // Write back to file
  fs.writeFileSync(adminFilePath, adminFileContent, "utf-8");

  console.log(`\n✅ Successfully added "${emailToAdd}" to admin list`);
  console.log(`  Name: ${user.name || "N/A"}`);
  console.log(`  Email: ${user.email}`);
  console.log(`\n📁 Updated file: lib/admin.ts`);
  console.log(`\n🎉 Done! User can now access admin features.\n`);
}

main()
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
