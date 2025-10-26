// app/api/mentor/earnings/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const runtime = "nodejs";

/**
 * GET /api/mentor/earnings
 * Get mentor's earnings statistics and payout history
 */
export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { mentorProfile: true },
    });

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const mentorId = user.mentorProfile.id;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Get all bookings with payments
    const allBookings = await db.booking.findMany({
      where: {
        mentorId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        stripePaidAt: { not: null },
      },
      select: {
        id: true,
        type: true,
        status: true,
        totalPrice: true,
        platformFee: true,
        mentorPayout: true,
        payoutStatus: true,
        payoutReleasedAt: true,
        payoutId: true,
        stripePaidAt: true,
        scheduledAt: true,
        durationMinutes: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        stripePaidAt: "desc",
      },
    });

    // Calculate statistics
    const lifetimeEarnings = allBookings.reduce((sum, b) => sum + (b.mentorPayout || 0), 0);
    const lifetimePlatformFees = allBookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);

    const thisMonthBookings = allBookings.filter(
      (b) => b.stripePaidAt && b.stripePaidAt >= monthStart && b.stripePaidAt <= monthEnd
    );
    const thisMonthEarnings = thisMonthBookings.reduce((sum, b) => sum + (b.mentorPayout || 0), 0);

    const paidOutBookings = allBookings.filter(
      (b) => b.payoutStatus === "PAID_OUT" || b.payoutStatus === "RELEASED"
    );
    const totalPaidOut = paidOutBookings.reduce((sum, b) => sum + (b.mentorPayout || 0), 0);

    const pendingBookings = allBookings.filter((b) => b.payoutStatus === "HELD");
    const pendingEarnings = pendingBookings.reduce((sum, b) => sum + (b.mentorPayout || 0), 0);

    // Get monthly earnings for last 6 months
    const monthlyEarnings = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const monthBookings = allBookings.filter(
        (b) => b.stripePaidAt && b.stripePaidAt >= start && b.stripePaidAt <= end
      );

      monthlyEarnings.push({
        month: monthDate.toLocaleString("en-US", { month: "short", year: "numeric" }),
        earnings: monthBookings.reduce((sum, b) => sum + (b.mentorPayout || 0), 0),
        bookingCount: monthBookings.length,
      });
    }

    // Get recent payouts (last 10)
    const recentPayouts = paidOutBookings.slice(0, 10).map((booking) => ({
      id: booking.id,
      amount: booking.mentorPayout,
      platformFee: booking.platformFee,
      totalPrice: booking.totalPrice,
      payoutId: booking.payoutId,
      paidAt: booking.payoutReleasedAt,
      bookingType: booking.type,
      customerName: booking.user.name || "Anonymous",
      scheduledAt: booking.scheduledAt,
    }));

    // Get pending bookings (awaiting payout)
    const pendingPayouts = pendingBookings.slice(0, 10).map((booking) => ({
      id: booking.id,
      amount: booking.mentorPayout,
      platformFee: booking.platformFee,
      totalPrice: booking.totalPrice,
      status: booking.status,
      payoutStatus: booking.payoutStatus,
      releaseDate: booking.payoutReleasedAt, // When funds will be released
      bookingType: booking.type,
      customerName: booking.user.name || "Anonymous",
      scheduledAt: booking.scheduledAt,
      paidByCustomerAt: booking.stripePaidAt,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        stats: {
          lifetimeEarnings,
          lifetimePlatformFees,
          thisMonthEarnings,
          totalPaidOut,
          pendingEarnings,
          totalBookings: allBookings.length,
          paidOutCount: paidOutBookings.length,
          pendingCount: pendingBookings.length,
        },
        monthlyEarnings,
        recentPayouts,
        pendingPayouts,
        stripeConnected: user.mentorProfile.stripeOnboarded || false,
        stripeAccountId: user.mentorProfile.stripeConnectId || null,
        // Trust status for anti-fraud system
        isTrusted: user.mentorProfile.isTrusted || false,
        verifiedBookingsCount: user.mentorProfile.verifiedBookingsCount || 0,
        trustThreshold: 5, // Need 5 verified bookings to become trusted
      },
    });
  } catch (error) {
    console.error("[mentor/earnings] GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch earnings data" },
      { status: 500 }
    );
  }
}
