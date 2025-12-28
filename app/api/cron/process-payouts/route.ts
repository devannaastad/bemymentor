// app/api/cron/process-payouts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processHeldPayouts } from "@/lib/payout-processor";
import { processBookingPayout } from "@/lib/payout-processor";

export const runtime = "nodejs";

/**
 * GET /api/cron/process-payouts
 * Processes held payouts that are ready to be released
 * AND auto-confirms bookings where 72 hours have passed
 *
 * This should be called daily via Vercel Cron or similar
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[cron:payouts] CRON_SECRET not configured");
      return NextResponse.json(
        { ok: false, error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("[cron:payouts] Invalid authorization");
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[cron:payouts] Starting payout processing job...");

    // Step 1: Auto-confirm bookings where 72 hours have passed
    const now = new Date();
    const bookingsToAutoConfirm = await db.booking.findMany({
      where: {
        status: "COMPLETED",
        studentConfirmedAt: null, // Not manually confirmed yet
        autoConfirmAt: {
          lte: now, // 72 hours have passed
        },
        isFraudReported: false,
      },
      include: {
        mentor: true,
      },
    });

    console.log(`[cron:payouts] Found ${bookingsToAutoConfirm.length} bookings to auto-confirm`);

    const autoConfirmResults = [];
    for (const booking of bookingsToAutoConfirm) {
      try {
        // Mark as auto-confirmed
        await db.booking.update({
          where: { id: booking.id },
          data: {
            studentConfirmedAt: now,
            isVerified: true,
            verifiedAt: now,
          },
        });

        // Increment mentor's verified count
        await db.mentor.update({
          where: { id: booking.mentorId },
          data: {
            verifiedBookingsCount: { increment: 1 },
          },
        });

        console.log(`[cron:payouts] Auto-confirmed booking ${booking.id}`);
        autoConfirmResults.push({ bookingId: booking.id, success: true });

        // Try to process payout now
        try {
          await processBookingPayout(booking.id);
        } catch (payoutError) {
          console.error(`[cron:payouts] Failed to process payout for auto-confirmed booking ${booking.id}:`, payoutError);
        }
      } catch (error) {
        console.error(`[cron:payouts] Failed to auto-confirm booking ${booking.id}:`, error);
        autoConfirmResults.push({ bookingId: booking.id, success: false, error });
      }
    }

    // Step 2: Process held payouts that are ready to release
    const payoutResults = await processHeldPayouts();

    console.log(`[cron:payouts] Completed. Auto-confirmed: ${autoConfirmResults.length}, Payouts processed: ${payoutResults.length}`);

    return NextResponse.json({
      ok: true,
      data: {
        autoConfirmed: autoConfirmResults,
        payoutsProcessed: payoutResults,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[cron:payouts] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process payouts" },
      { status: 500 }
    );
  }
}
