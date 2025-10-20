// app/mentor-dashboard/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import BookingList from "@/components/mentor-dashboard/BookingList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mentor Dashboard • BeMyMentor",
};

async function getMentorDashboardData(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      mentorProfile: true,
    },
  });

  if (!user || !user.mentorProfile) {
    return null;
  }

  const mentor = user.mentorProfile;

  // Get all bookings for this mentor
  const bookings = await db.booking.findMany({
    where: { mentorId: mentor.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [
      { status: "asc" }, // PENDING first
      { scheduledAt: "asc" }, // Then by scheduled time
      { createdAt: "desc" }, // Then by creation time
    ],
  });

  // Calculate stats
  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const totalEarnings = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return {
    user,
    mentor,
    bookings,
    stats: {
      pending,
      confirmed,
      completed,
      totalEarnings,
    },
  };
}

export default async function MentorDashboardPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/signin?callbackUrl=/mentor-dashboard");
  }

  const data = await getMentorDashboardData(email);

  if (!data) {
    return (
      <section className="section">
        <div className="container max-w-2xl">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="text-center">
              <div className="mb-4 text-6xl">👋</div>
              <h1 className="h2 mb-2">Not a Mentor Yet</h1>
              <p className="mb-6 text-white/70">
                You need to complete your mentor profile before accessing the dashboard.
              </p>
              <Button href="/apply" variant="primary">
                Apply to Become a Mentor
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const { mentor, bookings, stats } = data;

  const mentorName = session.user?.name?.split(" ")[0] || "Mentor";

  return (
    <section className="section">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="h1 mb-2">Mentor Dashboard</h1>
          <p className="text-white/60">
            Welcome back, {mentorName}! Manage your bookings and track your progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Pending Requests</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Confirmed</p>
                  <p className="text-3xl font-bold">{stats.confirmed}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Completed</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
                <div className="text-4xl">🎉</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Earnings</p>
                  <p className="text-3xl font-bold">
                    ${(stats.totalEarnings / 100).toFixed(0)}
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Status Banner */}
        {!mentor.isActive && (
          <Card className="mb-8 border-rose-500/20 bg-rose-500/5">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold text-rose-200">Profile Inactive</h3>
                  <p className="text-sm text-rose-100/70">
                    Your profile is currently inactive. You won&apos;t receive new bookings until
                    you reactivate it.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button href={`/mentors/${mentor.id}`} variant="secondary" size="sm">
                👁️ View My Public Profile
              </Button>
              <Button href="/settings" variant="secondary" size="sm">
                ⚙️ Edit Settings
              </Button>
              <Button href="/catalog" variant="secondary" size="sm">
                🔍 Browse Other Mentors
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardContent>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Bookings</h2>
              <Badge variant="outline">{bookings.length} total</Badge>
            </div>

            {bookings.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">📭</div>
                <h3 className="mb-2 text-lg font-semibold">No Bookings Yet</h3>
                <p className="text-white/60">
                  When learners book sessions with you, they&apos;ll appear here.
                </p>
              </div>
            ) : (
              <BookingList bookings={bookings} />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}