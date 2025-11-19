// scripts/list-stripe-connect-accounts.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

async function listConnectAccounts() {
  console.log("=== LISTING ALL STRIPE CONNECT ACCOUNTS ===\n");

  const accounts = await stripe.accounts.list({
    limit: 10,
  });

  console.log(`Found ${accounts.data.length} connected accounts:\n`);

  accounts.data.forEach((account, idx) => {
    console.log(`${idx + 1}. Account ID: ${account.id}`);
    console.log(`   Email: ${account.email || "Not set"}`);
    console.log(`   Type: ${account.type}`);
    console.log(`   Charges enabled: ${account.charges_enabled}`);
    console.log(`   Payouts enabled: ${account.payouts_enabled}`);
    console.log(`   Created: ${account.created ? new Date(account.created * 1000).toLocaleDateString() : "Unknown"}`);
    console.log();
  });
}

listConnectAccounts()
  .then(() => {
    console.log("\n✅ Complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
