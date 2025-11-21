// scripts/clear-stale-stripe.ts
import { db } from "../lib/db";

async function clearStaleStripeAccounts() {
  console.log("🧹 Clearing stale Stripe Connect account references...\n");

  // Find all mentors with Stripe Connect IDs
  const mentorsWithStripe = await db.mentor.findMany({
    where: {
      stripeConnectId: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  console.log(`Found ${mentorsWithStripe.length} mentors with Stripe account IDs\n`);

  for (const mentor of mentorsWithStripe) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 Mentor: ${mentor.name}`);
    console.log(`📧 Email: ${mentor.user.email}`);
    console.log(`🆔 Current Stripe ID: ${mentor.stripeConnectId}`);
    console.log(`✅ Onboarded: ${mentor.stripeOnboarded}`);

    // Clear the stale Stripe data
    await db.mentor.update({
      where: { id: mentor.id },
      data: {
        stripeConnectId: null,
        stripeOnboarded: false,
      },
    });

    console.log(`\n✓ Cleared Stripe account reference`);
    console.log(`  The mentor can now set up a fresh Stripe Connect account`);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`\n✅ Cleared ${mentorsWithStripe.length} stale Stripe account reference(s)`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Go to your mentor dashboard`);
  console.log(`   2. Click "Set up Stripe Connect" or "Connect to Stripe"`);
  console.log(`   3. This will create a NEW Stripe account with your current API keys`);
  console.log(`   4. Complete the onboarding process`);
  console.log(`\n⚠️  Make sure you're using the correct Stripe account:`);
  console.log(`   - Check your .env file for STRIPE_SECRET_KEY`);
  console.log(`   - Verify it matches the Stripe dashboard you want to use`);
  console.log(`   - Go to https://dashboard.stripe.com/test/apikeys to confirm\n`);
}

clearStaleStripeAccounts()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
