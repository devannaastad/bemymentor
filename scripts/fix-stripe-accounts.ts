// scripts/fix-stripe-accounts.ts
import { db } from "../lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

async function fixStripeAccounts() {
  console.log("🔍 Checking for duplicate Stripe accounts...\n");

  // Get all mentors with Stripe accounts
  const mentors = await db.mentor.findMany({
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

  console.log(`Found ${mentors.length} mentors with Stripe accounts\n`);

  for (const mentor of mentors) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 Mentor: ${mentor.name}`);
    console.log(`📧 Email: ${mentor.user.email}`);
    console.log(`🆔 Database Stripe ID: ${mentor.stripeConnectId}`);
    console.log(`✅ Onboarded: ${mentor.stripeOnboarded}`);

    try {
      // Check if the account exists and get its details
      const account = await stripe.accounts.retrieve(mentor.stripeConnectId!);

      console.log(`\n✓ Stripe Account Status:`);
      console.log(`  - Type: ${account.type}`);
      console.log(`  - Charges Enabled: ${account.charges_enabled}`);
      console.log(`  - Payouts Enabled: ${account.payouts_enabled}`);
      console.log(`  - Details Submitted: ${account.details_submitted}`);
      if (account.created) {
        console.log(`  - Created: ${new Date(account.created * 1000).toLocaleString()}`);
      }

      if (account.email) {
        console.log(`  - Account Email: ${account.email}`);
      }

      // Check if account needs updating in database
      const shouldBeOnboarded = account.details_submitted && account.charges_enabled;
      if (shouldBeOnboarded && !mentor.stripeOnboarded) {
        console.log(`\n⚠️  Account is fully onboarded but database shows false`);
        console.log(`   Would you like to update the database? (This will be done automatically)`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`\n❌ Error checking account: ${errorMessage}`);

      if (errorMessage.includes("No such account") || errorMessage.includes("does not exist")) {
        console.log(`\n⚠️  This account ID doesn't exist in Stripe!`);
        console.log(`   The database has a stale reference that should be cleared.`);
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("\n🔍 Now checking Stripe for all Express accounts...\n");

  // List all Express accounts in Stripe
  try {
    const accounts = await stripe.accounts.list({
      limit: 100,
    });

    console.log(`Found ${accounts.data.length} total Stripe Connect accounts\n`);

    const accountsByEmail: Record<string, any[]> = {};

    // Group accounts by email
    for (const account of accounts.data) {
      const email = account.email || "no-email";
      if (!accountsByEmail[email]) {
        accountsByEmail[email] = [];
      }
      accountsByEmail[email].push(account);
    }

    // Show duplicates
    for (const [email, accts] of Object.entries(accountsByEmail)) {
      if (accts.length > 1) {
        console.log(`\n⚠️  DUPLICATE ACCOUNTS for ${email}:`);
        accts.forEach((acc, idx) => {
          console.log(`\n  Account ${idx + 1}:`);
          console.log(`    - ID: ${acc.id}`);
          if (acc.created) {
            console.log(`    - Created: ${new Date(acc.created * 1000).toLocaleString()}`);
          }
          console.log(`    - Details Submitted: ${acc.details_submitted}`);
          console.log(`    - Charges Enabled: ${acc.charges_enabled}`);
          console.log(`    - Payouts Enabled: ${acc.payouts_enabled}`);

          // Check if this is in database
          const mentorWithThisAccount = mentors.find(m => m.stripeConnectId === acc.id);
          if (mentorWithThisAccount) {
            console.log(`    - ✓ IN DATABASE (${mentorWithThisAccount.name})`);
          } else {
            console.log(`    - ✗ NOT IN DATABASE (orphaned account)`);
          }
        });

        console.log(`\n  📝 Recommendation:`);
        const bestAccount = accts.reduce((best, curr) => {
          // Prefer accounts that are fully set up
          if (curr.details_submitted && curr.charges_enabled && curr.payouts_enabled) {
            return curr;
          }
          // Otherwise prefer the oldest
          if (curr.created && best.created) {
            return curr.created < best.created ? curr : best;
          }
          return best;
        });
        const createdStr = bestAccount.created ? ` (${new Date(bestAccount.created * 1000).toLocaleString()})` : '';
        console.log(`    Keep: ${bestAccount.id}${createdStr}`);
        console.log(`    Delete: ${accts.filter(a => a.id !== bestAccount.id).map(a => a.id).join(", ")}`);
      }
    }

  } catch (error) {
    console.error("Error listing Stripe accounts:", error);
  }

  console.log(`\n${"=".repeat(60)}\n`);
}

fixStripeAccounts()
  .then(() => {
    console.log("\n✅ Analysis complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
