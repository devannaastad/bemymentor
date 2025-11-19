// scripts/delete-orphaned-stripe-accounts.ts
import Stripe from "stripe";
import { db } from "../lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

async function deleteOrphanedAccounts() {
  console.log("=== DELETING ORPHANED STRIPE CONNECT ACCOUNTS ===\n");

  // Get the one valid mentor account from database
  const validMentor = await db.mentor.findFirst({
    where: {
      user: { email: "devannaastad@gmail.com" }
    },
    select: { stripeConnectId: true }
  });

  const validStripeAccountId = validMentor?.stripeConnectId;
  console.log(`✅ Valid account (will keep): ${validStripeAccountId}\n`);

  // List all Stripe Connect accounts
  const accounts = await stripe.accounts.list({ limit: 20 });

  const accountsToDelete = accounts.data.filter(
    (account) => account.id !== validStripeAccountId
  );

  console.log(`Found ${accountsToDelete.length} orphaned accounts to delete:\n`);

  for (const account of accountsToDelete) {
    console.log(`Deleting: ${account.id} (${account.email || "no email"})`);

    try {
      await stripe.accounts.del(account.id);
      console.log(`  ✅ Deleted successfully`);
    } catch (error: any) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
    console.log();
  }

  console.log(`\n✅ Cleanup complete! Kept only: ${validStripeAccountId}`);
}

deleteOrphanedAccounts()
  .then(() => {
    console.log("\n✅ Complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
