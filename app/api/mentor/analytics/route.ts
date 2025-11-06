// app/api/mentor/analytics/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { startOfMonth, subMonths, endOfMonth, format } from "date-fns";

export const dynamic = "force-dynamic";

/**
 * GET /api/mentor/analytics
 * Get analytics data for mentor dashboard
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

    // Get all bookings for analytics
    const allBookings = await db.booking.findMany({
      where: { mentorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Earnings by month (last 6 months)
    const earningsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(monthStart);

      const monthBookings = allBookings.filter((b) => {
        if (b.status !== "COMPLETED") return false;
        const completedDate = b.mentorCompletedAt || b.createdAt;
        return completedDate >= monthStart && completedDate <= monthEnd;
      });

      const totalEarnings = monthBookings.reduce((sum, b) => sum + (b.mentorPayout || 0), 0);

      earningsByMonth.push({
        month: format(monthStart, "MMM yyyy"),
        earnings: totalEarnings / 100, // Convert cents to dollars
        sessions: monthBookings.length,
      });
    }

    // Session stats
    const totalSessions = allBookings.filter((b) => b.type === "SESSION").length;
    const completedSessions = allBookings.filter(
      (b) => b.type === "SESSION" && b.status === "COMPLETED"
    ).length;
    const completionRate =
      totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Rating stats
    const reviewedBookings = allBookings.filter((b) => b.review !== null);
    const averageRating =
      reviewedBookings.length > 0
        ? reviewedBookings.reduce((sum, b) => sum + (b.review?.rating || 0), 0) /
          reviewedBookings.length
        : 0;

    // Top students (by number of sessions)
    const studentSessionCounts = new Map<
      string,
      {
        count: number;
        user: { id: string; name: string | null; email: string | null; image: string | null };
        totalSpent: number;
      }
    >();

    allBookings.forEach((booking) => {
      const userId = booking.user.id;
      const existing = studentSessionCounts.get(userId);

      if (existing) {
        existing.count++;
        existing.totalSpent += booking.totalPrice;
      } else {
        studentSessionCounts.set(userId, {
          count: 1,
          user: booking.user,
          totalSpent: booking.totalPrice,
        });
      }
    });

    const topStudents = Array.from(studentSessionCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        user: item.user,
        sessionCount: item.count,
        totalSpent: item.totalSpent / 100, // Convert to dollars
      }));

    // Total earnings (all time)
    const totalEarnings = allBookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.mentorPayout || 0), 0);

    // Pending earnings (confirmed but not completed)
    const pendingEarnings = allBookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + (b.mentorPayout || 0), 0);

    return NextResponse.json({
      ok: true,
      data: {
        earningsByMonth,
        stats: {
          totalEarnings: totalEarnings / 100,
          pendingEarnings: pendingEarnings / 100,
          totalSessions,
          completedSessions,
          completionRate,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalReviews: reviewedBookings.length,
        },
        topStudents,
      },
    });
  } catch (err) {
    console.error("[mentor/analytics] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
