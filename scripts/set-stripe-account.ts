// scripts/set-stripe-account.ts
import { db } from "../lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const ACCOUNT_ID = "acct_1SUeCYGlGRDGsFt3";

async function setStripeAccount() {
  console.log(`🔧 Setting Stripe account to: ${ACCOUNT_ID}\n`);

  // First, verify this account exists and we can access it
  try {
    const account = await stripe.accounts.retrieve(ACCOUNT_ID);

    console.log("✓ Account verified in Stripe:");
    console.log(`  - Type: ${account.type}`);
    console.log(`  - Email: ${account.email || "Not set"}`);
    console.log(`  - Charges Enabled: ${account.charges_enabled}`);
    console.log(`  - Payouts Enabled: ${account.payouts_enabled}`);
    console.log(`  - Details Submitted: ${account.details_submitted}`);
    if (account.created) {
      console.log(`  - Created: ${new Date(account.created * 1000).toLocaleString()}`);
    }
    console.log();

    // Check if fully onboarded
    const isFullyOnboarded = account.details_submitted && account.charges_enabled;

    // Find the mentor profile (assuming it's for devannaastad@gmail.com)
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

    // Update the database
    await db.mentor.update({
      where: { id: mentor.id },
      data: {
        stripeConnectId: ACCOUNT_ID,
        stripeOnboarded: isFullyOnboarded,
      },
    });

    console.log(`\n✅ Successfully updated database:`);
    console.log(`  - Stripe Connect ID: ${ACCOUNT_ID}`);
    console.log(`  - Onboarded: ${isFullyOnboarded}`);

    if (isFullyOnboarded) {
      console.log(`\n🎉 Your Stripe account is fully set up and ready to accept payments!`);
    } else {
      console.log(`\n⚠️  Stripe account needs to complete onboarding:`);
      console.log(`   - Go to your mentor dashboard`);
      console.log(`   - Click "Complete Stripe Setup" or "Connect to Stripe"`);
      console.log(`   - You'll be taken to finish the onboarding process`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Error verifying Stripe account: ${errorMessage}`);

    if (errorMessage.includes("does not have access")) {
      console.error(`\n⚠️  Your current Stripe API keys don't have access to this account.`);
      console.error(`   This usually means one of two things:`);
      console.error(`   1. You're using API keys from a different Stripe account`);
      console.error(`   2. The account was created with different API keys`);
      console.error(`\n   Please check your .env file and verify STRIPE_SECRET_KEY matches`);
      console.error(`   the Stripe dashboard where this account exists.`);
    }
  }
}

setStripeAccount()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
