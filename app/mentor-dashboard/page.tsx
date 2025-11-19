// app/mentor-dashboard/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import dynamicImport from "next/dynamic";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import ProfileCompletenessCard from "@/components/mentor/ProfileCompletenessCard";
import StripeConnectButton from "@/components/mentor-dashboard/StripeConnectButton";
import MentorDashboardTabs from "@/components/mentor-dashboard/MentorDashboardTabs";

// Lazy load heavy components
const BookingList = dynamicImport(() => import("@/components/mentor-dashboard/BookingList"), {
  loading: () => <div className="animate-pulse h-64 bg-white/5 rounded-lg" />,
});
const MentorCalendar = dynamicImport(() => import("@/components/mentor/MentorCalendar"), {
  loading: () => <div className="animate-pulse h-96 bg-white/5 rounded-lg" />,
});
const EarningsDashboard = dynamicImport(() => import("@/components/mentor-dashboard/EarningsDashboard"), {
  loading: () => <div className="animate-pulse h-64 bg-white/5 rounded-lg" />,
});
const AnalyticsDashboard = dynamicImport(() => import("@/components/mentor-dashboard/AnalyticsDashboard"), {
  loading: () => <div className="animate-pulse h-64 bg-white/5 rounded-lg" />,
});
const MentorMessages = dynamicImport(() => import("@/components/mentor-dashboard/MentorMessages"), {
  loading: () => <div className="animate-pulse h-64 bg-white/5 rounded-lg" />,
});

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
    // Check if user has an approved application
    const approvedApplication = await db.application.findFirst({
      where: {
        email,
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (approvedApplication) {
      // User was approved but hasn't completed mentor setup
      return (
        <section className="section">
          <div className="container max-w-2xl">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="text-center">
                <div className="mb-4 text-6xl">🎉</div>
                <h1 className="h2 mb-2">Congratulations! You&apos;re Accepted</h1>
                <p className="mb-6 text-white/70">
                  Your mentor application has been approved! Complete your profile setup to start mentoring.
                </p>
                <Button href="/mentor-setup" variant="primary">
                  Continue Profile Setup
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      );
    }

    // Not a mentor and no approved application
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

  const { mentor, bookings } = data;

  const mentorName = session.user?.name?.split(" ")[0] || "Mentor";

  return (
    <section className="section">
      <div className="container">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="h1 mb-2">Mentor Dashboard</h1>
            <p className="text-white/60">
              Welcome back, {mentorName}! Manage your bookings and track your progress.
            </p>
          </div>
          <div className="flex gap-3">
            <StripeConnectButton mentor={mentor} />
            <Button href="/mentor-dashboard/access-pass" variant="ghost">
              Access Pass Page
            </Button>
            <Button href="/mentor-dashboard/subscriptions" variant="ghost">
              Subscription Pages
            </Button>
            <Button href="/mentor/settings" variant="ghost">
              Settings
            </Button>
            <Button href="/mentor-dashboard/profile" variant="primary">
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="mb-8">
          <ProfileCompletenessCard mentor={mentor} />
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

        {/* Tabbed Dashboard */}
        <MentorDashboardTabs
          overviewSlot={
            <>
              {/* Bookings List */}
              <Card className="mb-8">
                <CardContent>
                  <h2 className="mb-6 text-lg font-semibold">Your Bookings</h2>
                  <BookingList bookings={bookings} />
                </CardContent>
              </Card>
            </>
          }
          messagesSlot={
            <>
              <h2 className="mb-6 text-2xl font-bold">Messages</h2>
              <MentorMessages />
            </>
          }
          calendarSlot={
            <>
              <h2 className="mb-6 text-2xl font-bold">Your Calendar</h2>
              <MentorCalendar mentorId={mentor.id} />
            </>
          }
          analyticsSlot={
            <>
              <h2 className="mb-6 text-2xl font-bold">📊 Analytics & Insights</h2>
              <AnalyticsDashboard />
            </>
          }
          earningsSlot={
            <>
              <h2 className="mb-6 text-2xl font-bold">Earnings & Payouts</h2>
              <EarningsDashboard />
            </>
          }
        />
      </div>
    </section>
  );
}