// lib/payout-processor.ts
import { db } from "./db";
import { createPayout, calculatePayoutAmounts } from "./stripe-connect";

/**
 * Anti-fraud payout system:
 * - New mentors (< 5 verified bookings): 7-day hold period
 * - Trusted mentors (5+ verified bookings): Immediate payout
 */

const TRUST_THRESHOLD = 5; // Number of verified bookings to become trusted
const HOLD_PERIOD_DAYS = 7; // Days to hold funds for new mentors

export async function processBookingPayout(bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      mentor: true,
      user: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Check if mentor has Stripe connected
  if (!booking.mentor.stripeConnectId || !booking.mentor.stripeOnboarded) {
    console.log(`[payout] Mentor ${booking.mentorId} not connected to Stripe, skipping payout`);
    return null;
  }

  // Check if booking is paid
  if (!booking.stripePaidAt) {
    console.log(`[payout] Booking ${bookingId} not paid yet, skipping payout`);
    return null;
  }

  // Check if already paid out
  if (booking.payoutStatus === "PAID_OUT") {
    console.log(`[payout] Booking ${bookingId} already paid out`);
    return null;
  }

  // NEW: Check if student has confirmed OR if fraud was reported
  const now = new Date();
  const isStudentConfirmed = booking.studentConfirmedAt !== null;
  const isAutoConfirmReady = booking.autoConfirmAt && now >= booking.autoConfirmAt;
  const isFraudReported = booking.isFraudReported;

  if (isFraudReported) {
    console.log(`[payout] Booking ${bookingId} has fraud report, holding payout indefinitely`);
    await db.booking.update({
      where: { id: bookingId },
      data: {
        payoutStatus: "HELD",
        payoutReleasedAt: null, // No release date - requires manual admin review
      },
    });
    return {
      status: "HELD",
      reason: "Fraud reported - requires admin review",
    };
  }

  // Only process payout if student confirmed OR auto-confirm time has passed
  if (!isStudentConfirmed && !isAutoConfirmReady) {
    const waitUntil = booking.autoConfirmAt || "unknown";
    console.log(`[payout] Booking ${bookingId} waiting for student confirmation (auto-confirm at ${waitUntil})`);
    return {
      status: "AWAITING_CONFIRMATION",
      reason: "Waiting for student confirmation or auto-confirm timeout",
      autoConfirmAt: booking.autoConfirmAt,
    };
  }

  // If auto-confirmed (not manually confirmed), mark it
  if (!isStudentConfirmed && isAutoConfirmReady) {
    console.log(`[payout] Booking ${bookingId} auto-confirming (student didn't respond within 72 hours)`);
    await db.booking.update({
      where: { id: bookingId },
      data: {
        studentConfirmedAt: now,
        isVerified: true,
        verifiedAt: now,
      },
    });
  }

  // Calculate payout amounts (15% platform fee, 85% mentor)
  const { platformFee, mentorPayout } = calculatePayoutAmounts(booking.totalPrice);

  // Update booking with fee breakdown if not already set
  if (!booking.platformFee || !booking.mentorPayout) {
    await db.booking.update({
      where: { id: bookingId },
      data: {
        platformFee,
        mentorPayout,
      },
    });
  }

  // Check if mentor is trusted (5+ verified bookings)
  const isTrusted = booking.mentor.verifiedBookingsCount >= TRUST_THRESHOLD;

  if (isTrusted) {
    // Trusted mentor: Immediate payout (after student confirmation)
    console.log(`[payout] Trusted mentor ${booking.mentorId}, processing immediate payout`);
    return await executePayout(booking.id, booking.mentor.stripeConnectId, mentorPayout);
  } else {
    // New mentor: Hold for 7 days (after student confirmation)
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + HOLD_PERIOD_DAYS);

    console.log(
      `[payout] New mentor ${booking.mentorId}, holding payout until ${releaseDate.toISOString()}`
    );

    await db.booking.update({
      where: { id: bookingId },
      data: {
        payoutStatus: "HELD",
        payoutReleasedAt: releaseDate,
      },
    });

    return {
      status: "HELD",
      releaseDate,
      reason: `Funds held for ${HOLD_PERIOD_DAYS} days (anti-fraud for new mentors)`,
    };
  }
}

/**
 * Execute the actual payout to Stripe
 */
async function executePayout(bookingId: string, stripeAccountId: string, amountInCents: number) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, mentor: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  try {
    const transfer = await createPayout(
      stripeAccountId,
      amountInCents,
      bookingId,
      `Payout for booking from ${booking.user.name || booking.user.email}`
    );

    await db.booking.update({
      where: { id: bookingId },
      data: {
        payoutStatus: "PAID_OUT",
        payoutId: transfer.id,
        payoutReleasedAt: new Date(),
      },
    });

    console.log(`[payout] Successfully paid out $${(amountInCents / 100).toFixed(2)} to mentor ${booking.mentorId}`);

    return {
      status: "PAID_OUT",
      transferId: transfer.id,
      amount: amountInCents,
    };
  } catch (error) {
    console.error("[payout] Failed to execute payout:", error);
    throw error;
  }
}

/**
 * Mark a booking as verified by customer (no scam)
 * This counts toward the mentor's trust score
 */
export async function verifyBooking(bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { mentor: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.isVerified) {
    return { alreadyVerified: true };
  }

  // Mark booking as verified
  await db.booking.update({
    where: { id: bookingId },
    data: {
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  // Increment mentor's verified bookings count
  const updatedMentor = await db.mentor.update({
    where: { id: booking.mentorId },
    data: {
      verifiedBookingsCount: { increment: 1 },
    },
  });

  // Check if mentor just became trusted
  const wasTrusted = booking.mentor.verifiedBookingsCount >= TRUST_THRESHOLD;
  const nowTrusted = updatedMentor.verifiedBookingsCount >= TRUST_THRESHOLD;

  if (!wasTrusted && nowTrusted) {
    await db.mentor.update({
      where: { id: booking.mentorId },
      data: { isTrusted: true },
    });

    console.log(`[trust] Mentor ${booking.mentorId} is now TRUSTED (${updatedMentor.verifiedBookingsCount} verified bookings)`);
  }

  return {
    verified: true,
    mentorVerifiedCount: updatedMentor.verifiedBookingsCount,
    mentorNowTrusted: nowTrusted,
  };
}

/**
 * Report a booking as fraud
 * This should be called when a customer reports they were scammed
 */
export async function reportFraud(bookingId: string, notes: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  await db.booking.update({
    where: { id: bookingId },
    data: {
      isFraudReported: true,
      fraudReportedAt: new Date(),
      fraudNotes: notes,
      payoutStatus: "REFUNDED", // Block payout
    },
  });

  console.log(`[fraud] Fraud reported for booking ${bookingId}`);

  // TODO: Send notification to admin
  // TODO: Consider suspending mentor account

  return { fraudReported: true };
}

/**
 * Process all held payouts that are ready to be released
 * This should be run via a cron job daily
 */
export async function processHeldPayouts() {
  const now = new Date();

  const heldBookings = await db.booking.findMany({
    where: {
      payoutStatus: "HELD",
      payoutReleasedAt: {
        lte: now, // Release date has passed
      },
      isFraudReported: false, // Not reported as fraud
    },
    include: {
      mentor: true,
    },
  });

  console.log(`[payout-cron] Found ${heldBookings.length} bookings ready to release`);

  const results = [];

  for (const booking of heldBookings) {
    try {
      if (!booking.mentor.stripeConnectId || !booking.mentorPayout) {
        console.log(`[payout-cron] Skipping booking ${booking.id} - missing Stripe or payout amount`);
        continue;
      }

      const result = await executePayout(
        booking.id,
        booking.mentor.stripeConnectId,
        booking.mentorPayout
      );

      results.push({ bookingId: booking.id, success: true, result });
    } catch (error) {
      console.error(`[payout-cron] Failed to process payout for booking ${booking.id}:`, error);
      results.push({ bookingId: booking.id, success: false, error });
    }
  }

  return results;
}
