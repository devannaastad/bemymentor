// scripts/delete-duplicate-stripe-accounts.ts
import { db } from "../lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

// The account you want to KEEP
const KEEP_ACCOUNT_ID = "acct_1SUeCYGlGRDGsFt3";

async function deleteDuplicateAccounts() {
  console.log("🔍 Listing all Stripe Connect accounts...\n");

  try {
    // Get all Connect accounts
    const accounts = await stripe.accounts.list({
      limit: 100,
    });

    console.log(`Found ${accounts.data.length} total accounts\n`);

    const accountsToDelete: string[] = [];
    let keepAccount = null;

    for (const account of accounts.data) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Account ID: ${account.id}`);
      console.log(`Email: ${account.email || "Not set"}`);
      console.log(`Type: ${account.type}`);
      console.log(`Charges Enabled: ${account.charges_enabled}`);
      console.log(`Details Submitted: ${account.details_submitted}`);
      if (account.created) {
        console.log(`Created: ${new Date(account.created * 1000).toLocaleString()}`);
      }

      if (account.id === KEEP_ACCOUNT_ID) {
        console.log(`\n✅ KEEPING THIS ACCOUNT`);
        keepAccount = account;
      } else {
        console.log(`\n❌ WILL DELETE THIS ACCOUNT`);
        accountsToDelete.push(account.id);
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`\n📋 Summary:`);
    console.log(`  - Accounts to keep: 1 (${KEEP_ACCOUNT_ID})`);
    console.log(`  - Accounts to delete: ${accountsToDelete.length}`);

    if (!keepAccount) {
      console.error(`\n❌ ERROR: The account you want to keep (${KEEP_ACCOUNT_ID}) was not found!`);
      console.error(`   Please verify the account ID is correct.`);
      return;
    }

    console.log(`\n⚠️  About to delete ${accountsToDelete.length} accounts:`);
    accountsToDelete.forEach((id, idx) => {
      console.log(`  ${idx + 1}. ${id}`);
    });

    console.log(`\n🚀 Starting deletion process...\n`);

    // Delete each account
    for (const accountId of accountsToDelete) {
      try {
        console.log(`Deleting ${accountId}...`);
        await stripe.accounts.del(accountId);
        console.log(`✅ Successfully deleted ${accountId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to delete ${accountId}: ${errorMessage}`);
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`\n✅ Cleanup complete!`);
    console.log(`\nNext steps:`);
    console.log(`1. Update your database to use ${KEEP_ACCOUNT_ID}`);
    console.log(`2. Go to bemymentor.dev and refresh the Stripe dashboard`);
    console.log(`3. You should now see only ONE account: ${KEEP_ACCOUNT_ID}`);

  } catch (error) {
    console.error("Error:", error);
  }
}

deleteDuplicateAccounts()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
