// lib/stripe-connect.ts
import { stripe } from "./stripe";

/**
 * Create a Stripe Connect account for a mentor
 * Pre-fills as much information as possible to make onboarding faster
 */
export async function createConnectAccount(email: string, mentorName: string) {
  // Split name into first and last (or use full name if can't split)
  const nameParts = mentorName.trim().split(/\s+/);
  const firstName = nameParts[0] || mentorName;
  const lastName = nameParts.slice(1).join(" ") || mentorName;

  const account = await stripe.accounts.create({
    type: "express", // Express = simplified onboarding
    email,
    country: "US", // Change if you support other countries
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    business_profile: {
      mcc: "8299", // Educational Services
      product_description: "Online mentorship and coaching services",
    },
    individual: {
      email,
      first_name: firstName,
      last_name: lastName,
    },
    settings: {
      payouts: {
        schedule: {
          // New mentors start with weekly payouts and 7-day hold
          interval: "weekly",
          delay_days: 7,
          weekly_anchor: "monday",
        },
      },
    },
    metadata: {
      mentorName,
      platform: "BeMyMentor",
    },
  });

  return account;
}

/**
 * Create an account link for onboarding
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink;
}

/**
 * Check if a Connect account is fully onboarded
 */
export async function checkAccountOnboarding(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);

  return {
    onboarded: account.charges_enabled && account.payouts_enabled,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  };
}

/**
 * Create a login link for existing Connect accounts
 */
export async function createLoginLink(accountId: string) {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink;
}

/**
 * Create a transfer to pay a mentor
 */
export async function createPayout(
  accountId: string,
  amountInCents: number,
  bookingId: string,
  description: string
) {
  const transfer = await stripe.transfers.create({
    amount: amountInCents,
    currency: "usd",
    destination: accountId,
    description,
    metadata: {
      bookingId,
    },
  });

  return transfer;
}

/**
 * Calculate platform fee and mentor payout
 * Platform takes 15% fee
 */
export function calculatePayoutAmounts(totalPriceInCents: number) {
  const platformFeePercent = 0.15; // 15%
  const platformFee = Math.round(totalPriceInCents * platformFeePercent);
  const mentorPayout = totalPriceInCents - platformFee;

  return {
    platformFee,
    mentorPayout,
  };
}

/**
 * Configure payout schedule based on mentor trust status
 * New mentors (< 5 verified bookings): 7-day hold
 * Trusted mentors (5+ verified bookings): Daily payouts
 */
export async function updatePayoutSchedule(accountId: string, isTrusted: boolean) {
  const payoutSchedule = isTrusted
    ? {
        // Trusted mentors: Daily automatic payouts with standard 2-day delay
        interval: "daily" as const,
        delay_days: 2, // Standard Stripe delay
      }
    : {
        // New mentors: Weekly payouts with 7-day hold period
        interval: "weekly" as const,
        delay_days: 7, // 7-day fraud protection hold
        weekly_anchor: "monday" as const,
      };

  await stripe.accounts.update(accountId, {
    settings: {
      payouts: {
        schedule: payoutSchedule,
      },
    },
  });
}

/**
 * Check if mentor should be upgraded to trusted status
 * Requirements: 5+ verified bookings with no fraud reports
 */
export function shouldUpgradeToTrusted(verifiedBookingsCount: number, isTrusted: boolean): boolean {
  return verifiedBookingsCount >= 5 && !isTrusted;
}

/**
 * Issue a refund for a payment
 */
export async function issueRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount, // Optional partial refund (in cents). If not provided, full refund
    reason: reason as "duplicate" | "fraudulent" | "requested_by_customer" | undefined,
  });

  return refund;
}

/**
 * Reverse a transfer to a connected account (claw back funds from mentor)
 */
export async function reverseTransfer(transferId: string, amount?: number) {
  const reversal = await stripe.transfers.createReversal(transferId, {
    amount, // Optional partial reversal
  });

  return reversal;
}
