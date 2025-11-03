// app/dashboard/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import MentorCard from "@/components/catalog/MentorCard";
import Image from "next/image";
import StudentConfirmation from "@/components/booking/StudentConfirmation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - BeMyMentor",
  description: "Manage your bookings, saved mentors, and mentorship journey",
};

export const dynamic = "force-dynamic";


async function getDashboardData(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      mentorProfile: true,
    },
  });

  if (!user) {
    return null;
  }

  const [savedMentors, application, bookings] = await Promise.all([
    // Get saved mentors
    db.savedMentor
      .findMany({
        where: { userId: user.id },
        include: { mentor: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      })
      .then((saved) => saved.map((s) => s.mentor)),

    // Check if user has applied as mentor
    db.application.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    }),

    // Get user's bookings
    db.booking.findMany({
      where: { userId: user.id },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            category: true,
            profileImage: true,
          },
        },
        review: true,
      },
      orderBy: { scheduledAt: "desc" },
      take: 10,
    }),
  ]);

  return { user, savedMentors, application, bookings };
}

export default async function DashboardPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const data = await getDashboardData(email);

  if (!data) {
    redirect("/signin");
  }

  const { user, savedMentors, application, bookings } = data;

  const userName = session.user?.name?.split(" ")[0] || "there";

  // Check if they have an approved application but no mentor profile yet
  const needsSetup = application?.status === "APPROVED" && !user.mentorProfile;

  // Find bookings that need student confirmation
  const bookingsNeedingConfirmation = bookings.filter(
    (b) => b.mentorCompletedAt && !b.studentConfirmedAt && !b.fraudReportedAt
  );

  return (
    <section className="section">
      <div className="container">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="h1 mb-2">Welcome back, {userName}!</h1>
          <p className="text-white/60">Here&apos;s what&apos;s happening with your mentorship journey.</p>
        </div>

        {/* Sessions Needing Confirmation */}
        {bookingsNeedingConfirmation.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Sessions Awaiting Your Confirmation</h2>
            <div className="space-y-4">
              {bookingsNeedingConfirmation.map((booking) => (
                <StudentConfirmation
                  key={booking.id}
                  bookingId={booking.id}
                  mentorName={booking.mentor.name}
                  mentorCompletedAt={booking.mentorCompletedAt}
                  studentConfirmedAt={booking.studentConfirmedAt}
                  autoConfirmAt={booking.autoConfirmAt}
                  isFraudReported={!!booking.fraudReportedAt}
                />
              ))}
            </div>
          </div>
        )}

        {/* Setup Prompt - Show if approved but no profile */}
        {needsSetup && (
          <Card className="mb-8 border-emerald-500/20 bg-emerald-500/5">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎉</div>
                <div className="flex-1">
                  <h2 className="mb-2 text-lg font-semibold text-emerald-200">
                    Your Application Was Approved!
                  </h2>
                  <p className="mb-4 text-sm text-white/70">
                    Complete your mentor profile to start accepting learners.
                  </p>
                  <Button href="/mentor-setup" variant="primary">
                    Complete Profile Setup →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Saved Mentors</p>
                  <p className="text-3xl font-bold">{savedMentors.length}</p>
                </div>
                <div className="text-4xl">🔖</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Bookings</p>
                  <p className="text-3xl font-bold">{bookings.length}</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Active Sessions</p>
                  <p className="text-3xl font-bold">
                    {bookings.filter((b) => b.status === "CONFIRMED").length}
                  </p>
                </div>
                <div className="text-4xl">⏱️</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Completed</p>
                  <p className="text-3xl font-bold">
                    {bookings.filter((b) => b.status === "COMPLETED").length}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Bookings</h2>
            </div>

            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {booking.mentor.profileImage && (
                        <Image
                            src={booking.mentor.profileImage}
                            alt={booking.mentor.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                        )}
                      <div>
                        <h3 className="font-semibold">{booking.mentor.name}</h3>
                        <p className="text-sm text-white/60">
                          {booking.type === "ACCESS" ? "ACCESS Pass" : "1-on-1 Session"}
                          {booking.scheduledAt &&
                            ` • ${new Date(booking.scheduledAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          booking.status === "CONFIRMED"
                            ? "success"
                            : booking.status === "PENDING"
                            ? "warning"
                            : booking.status === "COMPLETED"
                            ? "default"
                            : "default"
                        }
                      >
                        {booking.status}
                      </Badge>
                      {booking.type === "ACCESS" && (booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
                        <Button href={`/access-pass/${booking.mentor.id}`} variant="primary" size="sm">
                          Access Content
                        </Button>
                      )}
                      {booking.type === "SESSION" && booking.status === "COMPLETED" && !booking.review && (
                        <Button href={`/bookings/${booking.id}/review`} variant="primary" size="sm">
                          Write Review
                        </Button>
                      )}
                      {booking.status === "COMPLETED" && booking.review && (
                        <Badge variant="success">Reviewed</Badge>
                      )}
                      <Button href={`/bookings/${booking.id}/confirm`} variant="ghost" size="sm">
                        View →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Application Status */}
        {application && (
          <Card className="mb-8">
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Your Mentor Application</h2>
                    <Badge
                      variant={
                        application.status === "APPROVED"
                          ? "success"
                          : application.status === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/70">
                    Topic: <strong>{application.topic}</strong>
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Submitted on {new Date(application.createdAt).toLocaleDateString()}
                  </p>

                  {application.status === "PENDING" && (
                    <p className="mt-3 text-sm text-white/60">
                      We&apos;re reviewing your application. You&apos;ll hear back within 48 hours.
                    </p>
                  )}

                  {application.status === "APPROVED" && !user.mentorProfile && (
                    <div className="mt-3">
                      <p className="text-sm text-emerald-300">
                        Congratulations! Your application has been approved.
                      </p>
                      <Button href="/mentor-setup" className="mt-3" variant="primary">
                        Complete Setup →
                      </Button>
                    </div>
                  )}

                  {application.status === "APPROVED" && user.mentorProfile && (
                    <div className="mt-3">
                      <p className="text-sm text-emerald-300">
                        ✓ Your mentor profile is live!
                      </p>
                      <Button href={`/mentors/${user.mentorProfile.id}`} className="mt-3" variant="ghost">
                        View Your Profile →
                      </Button>
                    </div>
                  )}

                  {application.status === "REJECTED" && (
                    <p className="mt-3 text-sm text-rose-300">
                      Unfortunately, we couldn&apos;t approve your application at this time. Feel free to apply again after improving your proof materials.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Mentors Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Saved Mentors</h2>
            {savedMentors.length > 0 && (
              <Button href="/saved" variant="ghost" size="sm">
                View All →
              </Button>
            )}
          </div>

          {savedMentors.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-lg font-semibold">No saved mentors yet</h3>
                <p className="mb-4 text-white/60">
                  Explore our catalog and save mentors you&apos;re interested in!
                </p>
                <Button href="/catalog">Browse Mentors</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedMentors.map((mentor) => (
                <MentorCard key={mentor.id} m={mentor} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button href="/catalog" variant="ghost" className="justify-start">
                🔍 Browse Mentors
              </Button>
              <Button href="/saved" variant="ghost" className="justify-start">
                🔖 View Saved
              </Button>
              {!application && (
                <Button href="/apply" variant="ghost" className="justify-start">
                  ✨ Become a Mentor
                </Button>
              )}
              <Button href="/settings" variant="ghost" className="justify-start">
                ⚙️ Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}