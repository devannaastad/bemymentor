// app/api/cron/cancel-unpaid-bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/cancel-unpaid-bookings
 * Auto-cancel PENDING bookings that haven't been paid for within 30 minutes
 *
 * Run via Vercel Cron: every 5-10 minutes
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error("[cron/cancel-unpaid-bookings] Unauthorized access attempt");
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Calculate cutoff time (30 minutes ago)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find all PENDING bookings created more than 30 minutes ago without payment
    const unpaidBookings = await db.booking.findMany({
      where: {
        status: "PENDING",
        stripePaidAt: null, // Not paid
        createdAt: {
          lte: thirtyMinutesAgo,
        },
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        mentor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (unpaidBookings.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No unpaid bookings to cancel",
        cancelled: 0,
      });
    }

    console.log(`[cron/cancel-unpaid-bookings] Found ${unpaidBookings.length} unpaid bookings to cancel`);

    // Cancel all unpaid bookings
    const bookingIds = unpaidBookings.map((b) => b.id);

    const result = await db.booking.updateMany({
      where: {
        id: {
          in: bookingIds,
        },
      },
      data: {
        status: "CANCELLED",
      },
    });

    // Log the cancelled bookings for monitoring
    console.log(`[cron/cancel-unpaid-bookings] Cancelled ${result.count} unpaid bookings:`);
    unpaidBookings.forEach((booking) => {
      console.log(`  - Booking ${booking.id} (user: ${booking.user.email}, created: ${booking.createdAt.toISOString()})`);
    });

    // TODO: Optionally send notification to users that their booking was cancelled
    // You could create notifications here or send emails

    return NextResponse.json({
      ok: true,
      message: `Cancelled ${result.count} unpaid booking(s)`,
      cancelled: result.count,
      bookings: unpaidBookings.map((b) => ({
        id: b.id,
        userEmail: b.user.email,
        mentorName: b.mentor.name,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("[cron/cancel-unpaid-bookings] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to cancel unpaid bookings" },
      { status: 500 }
    );
  }
}
