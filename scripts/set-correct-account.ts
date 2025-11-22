// scripts/set-correct-account.ts
import { db } from "../lib/db";

const CORRECT_ACCOUNT_ID = "acct_1SUeCYGlGRDGsFt3";

async function setCorrectAccount() {
  console.log(`🔧 Setting Stripe account to: ${CORRECT_ACCOUNT_ID}\n`);

  // Find the mentor profile
  const user = await db.user.findUnique({
    where: { email: "devannaastad@gmail.com" },
    include: { mentorProfile: true },
  });

  if (!user || !user.mentorProfile) {
    console.error("❌ Could not find mentor profile for devannaastad@gmail.com");
    return;
  }

  const mentor = user.mentorProfile;
  console.log(`📋 Found mentor: ${mentor.name}`);
  console.log(`   Current Stripe ID: ${mentor.stripeConnectId || "None"}`);
  console.log(`   Current Onboarded: ${mentor.stripeOnboarded}`);

  // Update the database
  await db.mentor.update({
    where: { id: mentor.id },
    data: {
      stripeConnectId: CORRECT_ACCOUNT_ID,
      stripeOnboarded: true, // Assuming the account is onboarded
    },
  });

  console.log(`\n✅ Successfully updated database:`);
  console.log(`   - Stripe Connect ID: ${CORRECT_ACCOUNT_ID}`);
  console.log(`   - Onboarded: true`);
  console.log(`\n🎉 Your Stripe account is now correctly configured!`);
}

setCorrectAccount()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
