// scripts/check-image-urls.ts
import { db } from "../lib/db";

async function checkImageUrls() {
  console.log("Checking image URLs in database...\n");

  // Check User images
  const users = await db.user.findMany({
    where: { image: { not: null } },
    select: { id: true, email: true, image: true },
    take: 10,
  });

  console.log("=== USER IMAGES ===");
  users.forEach((user) => {
    const isOldFormat = user.image?.includes("uploadthing.com") ||
                       (user.image?.includes("utfs.io") && !user.image?.includes("ufs.sh"));
    console.log(`${user.email}: ${user.image}`);
    console.log(`  Format: ${isOldFormat ? "OLD ❌" : "NEW ✅"}\n`);
  });

  // Check Mentor images
  const mentors = await db.mentor.findMany({
    where: {
      user: { image: { not: null } }
    },
    select: {
      id: true,
      name: true,
      user: { select: { image: true } }
    },
    take: 10,
  });

  console.log("\n=== MENTOR PROFILE IMAGES ===");
  mentors.forEach((mentor) => {
    const image = mentor.user.image;
    const isOldFormat = image?.includes("uploadthing.com") ||
                       (image?.includes("utfs.io") && !image?.includes("ufs.sh"));
    console.log(`${mentor.name}: ${image}`);
    console.log(`  Format: ${isOldFormat ? "OLD ❌" : "NEW ✅"}\n`);
  });

  // Summary
  const totalUsers = users.length;
  const oldFormatUsers = users.filter(u =>
    u.image?.includes("uploadthing.com") ||
    (u.image?.includes("utfs.io") && !u.image?.includes("ufs.sh"))
  ).length;

  console.log("\n=== SUMMARY ===");
  console.log(`Total users with images: ${totalUsers}`);
  console.log(`Old format URLs: ${oldFormatUsers}`);
  console.log(`New format URLs: ${totalUsers - oldFormatUsers}`);

  if (oldFormatUsers > 0) {
    console.log("\n⚠️  Found old format URLs. These might not load correctly.");
    console.log("Old URLs might still work, but they won't benefit from Next.js image optimization.");
    console.log("New uploads will use the correct format automatically.");
  }
}

checkImageUrls()
  .then(() => {
    console.log("\n✅ Check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
