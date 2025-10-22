// lib/analytics.ts
import { db } from "@/lib/db";

export interface MentorAnalytics {
  totalEarnings: number; // in cents
  totalBookings: number;
  completedSessions: number;
  activeAccessPasses: number;
  averageRating: number;
  totalReviews: number;
  upcomingSessions: number;
  pendingBookings: number;
  recentBookings: Array<{
    id: string;
    type: string;
    status: string;
    totalPrice: number;
    scheduledAt: Date | null;
    user: {
      name: string | null;
    };
  }>;
  earningsByMonth: Array<{
    month: string;
    earnings: number;
  }>;
}

export async function getMentorAnalytics(mentorId: string): Promise<MentorAnalytics> {
  // Get all bookings for this mentor
  const bookings = await db.booking.findMany({
    where: { mentorId },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total earnings (from completed and paid bookings)
  const totalEarnings = bookings
    .filter((b) => b.status === "COMPLETED" && b.mentorPayout)
    .reduce((sum, b) => sum + (b.mentorPayout || 0), 0);

  // Total bookings
  const totalBookings = bookings.length;

  // Completed sessions
  const completedSessions = bookings.filter(
    (b) => b.type === "SESSION" && b.status === "COMPLETED"
  ).length;

  // Active ACCESS passes
  const activeAccessPasses = bookings.filter(
    (b) => b.type === "ACCESS" && b.status === "CONFIRMED"
  ).length;

  // Get reviews
  const reviews = await db.review.findMany({
    where: { mentorId },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const totalReviews = reviews.length;

  // Upcoming sessions
  const now = new Date();
  const upcomingSessions = bookings.filter(
    (b) =>
      b.type === "SESSION" &&
      b.status === "CONFIRMED" &&
      b.scheduledAt &&
      b.scheduledAt > now
  ).length;

  // Pending bookings
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;

  // Recent bookings (last 10)
  const recentBookings = bookings.slice(0, 10).map((b) => ({
    id: b.id,
    type: b.type,
    status: b.status,
    totalPrice: b.totalPrice,
    scheduledAt: b.scheduledAt,
    user: {
      name: b.user.name,
    },
  }));

  // Earnings by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyEarnings = new Map<string, number>();

  bookings
    .filter(
      (b) =>
        b.status === "COMPLETED" &&
        b.mentorPayout &&
        b.createdAt >= sixMonthsAgo
    )
    .forEach((b) => {
      const monthKey = b.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      const current = monthlyEarnings.get(monthKey) || 0;
      monthlyEarnings.set(monthKey, current + (b.mentorPayout || 0));
    });

  const earningsByMonth = Array.from(monthlyEarnings.entries())
    .map(([month, earnings]) => ({ month, earnings }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  return {
    totalEarnings,
    totalBookings,
    completedSessions,
    activeAccessPasses,
    averageRating,
    totalReviews,
    upcomingSessions,
    pendingBookings,
    recentBookings,
    earningsByMonth,
  };
}
