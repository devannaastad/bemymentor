// scripts/check-payout-schedule.ts
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

async function checkPayoutSchedule() {
  try {
    console.log("\n🔍 Checking Mentor Payout Schedule...\n");

    // Get the mentor with Stripe Connect
    const mentor = await db.mentor.findFirst({
      where: { stripeOnboarded: true },
      select: {
        id: true,
        name: true,
        stripeConnectId: true,
        isTrusted: true,
        verifiedBookingsCount: true,
      },
    });

    if (!mentor?.stripeConnectId) {
      console.log("❌ No mentor with Stripe Connect found");
      return;
    }

    console.log("=== Mentor Info ===");
    console.log("Name:", mentor.name);
    console.log("Trusted:", mentor.isTrusted ? "✅ Yes" : "❌ No (< 5 verified bookings)");
    console.log("Verified Bookings:", mentor.verifiedBookingsCount);
    console.log("Stripe Connect ID:", mentor.stripeConnectId);

    // Get the Stripe account details
    const account = await stripe.accounts.retrieve(mentor.stripeConnectId);

    console.log("\n=== Payout Schedule ===");
    console.log("Interval:", account.settings?.payouts?.schedule?.interval);
    console.log("Delay (days):", account.settings?.payouts?.schedule?.delay_days);
    if (account.settings?.payouts?.schedule?.weekly_anchor) {
      console.log("Weekly Anchor:", account.settings.payouts.schedule.weekly_anchor);
    }

    // Expected schedule
    if (mentor.isTrusted) {
      console.log("\n✅ TRUSTED MENTOR - Should have:");
      console.log("   - Daily payouts");
      console.log("   - 2-day delay");
    } else {
      console.log("\n⏳ NEW MENTOR - Should have:");
      console.log("   - Weekly payouts");
      console.log("   - 7-day delay");
      console.log("   - Monday anchor");
    }

    console.log("\n=== Account Status ===");
    console.log("Charges Enabled:", account.charges_enabled ? "✅" : "❌");
    console.log("Payouts Enabled:", account.payouts_enabled ? "✅" : "❌");
    console.log("Details Submitted:", account.details_submitted ? "✅" : "❌");

    // Get balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: mentor.stripeConnectId,
    });

    console.log("\n=== Balance ===");
    const availableFormatted = balance.available.map(
      (b) => `$${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`
    );
    const pendingFormatted = balance.pending.map(
      (b) => `$${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`
    );

    console.log("Available:", availableFormatted.join(", ") || "$0.00 USD");
    console.log("Pending:", pendingFormatted.join(", ") || "$0.00 USD");

    // Get upcoming payouts
    const payouts = await stripe.payouts.list(
      { limit: 5 },
      { stripeAccount: mentor.stripeConnectId }
    );

    if (payouts.data.length > 0) {
      console.log("\n=== Recent/Upcoming Payouts ===");
      payouts.data.forEach((payout) => {
        const date = new Date(payout.arrival_date * 1000).toLocaleDateString();
        const amount = `$${(payout.amount / 100).toFixed(2)}`;
        console.log(`${date}: ${amount} ${payout.currency.toUpperCase()} - ${payout.status}`);
      });
    } else {
      console.log("\n=== No Payouts Yet ===");
      console.log("The next payout will be created on November 16th");
      console.log("(Weekly schedule with Monday anchor + 7-day hold)");
    }

    console.log("\n✅ Payout schedule check complete!\n");
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
  } finally {
    await db.$disconnect();
  }
}

checkPayoutSchedule();
