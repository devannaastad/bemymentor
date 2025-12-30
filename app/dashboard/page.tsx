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

  const [savedMentors, application, bookings, subscriptions] = await Promise.all([
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

    // Get user's active subscriptions
    db.userSubscription.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      include: {
        plan: true,
        mentor: {
          select: {
            id: true,
            name: true,
            category: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { user, savedMentors, application, bookings, subscriptions };
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

  const { user, savedMentors, application, bookings, subscriptions } = data;

  const userName = session.user?.name?.split(" ")[0] || "there";

  // Check if they have an approved application but no mentor profile yet
  const needsSetup = application?.status === "APPROVED" && !user.mentorProfile;

  // Find bookings that need student confirmation
  const bookingsNeedingConfirmation = bookings.filter(
    (b) => b.mentorCompletedAt && !b.studentConfirmedAt && !b.fraudReportedAt
  );

  // Get ACCESS passes (completed or confirmed ACCESS bookings)
  const accessPasses = bookings.filter(
    (b) => b.type === "ACCESS" && (b.status === "CONFIRMED" || b.status === "COMPLETED")
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
                          {booking.scheduledAt && (
                            <>
                              {" • "}
                              {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                              {" at "}
                              {new Date(booking.scheduledAt).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                              {booking.durationMinutes && ` (${booking.durationMinutes} min)`}
                            </>
                          )}
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
                      {booking.type === "SESSION" && booking.status === "CONFIRMED" && booking.meetingLink && (
                        <Button href={booking.meetingLink} variant="primary" size="sm" target="_blank">
                          Join Meeting 🎥
                        </Button>
                      )}
                      {booking.type === "ACCESS" && (booking.status === "CONFIRMED" || booking.status === "COMPLETED") && (
                        <Button href={`/access-pass/${booking.mentor.id}`} variant="primary" size="sm">
                          Access Content
                        </Button>
                      )}
                      {booking.status === "CONFIRMED" && (
                        <Button href={`/bookings/${booking.id}/complete`} variant="primary" size="sm">
                          Complete Session ✓
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

        {/* Access Content Section */}
        {accessPasses.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Access Content</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accessPasses.map((pass) => (
                <Card key={pass.id}>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      {pass.mentor.profileImage && (
                        <Image
                          src={pass.mentor.profileImage}
                          alt={pass.mentor.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{pass.mentor.name}</h3>
                        <p className="text-sm text-white/60 mb-3">ACCESS Pass</p>
                        <Button href={`/access-pass/${pass.mentor.id}`} variant="primary" size="sm">
                          View Content →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Subscriptions Section */}
        {subscriptions.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Active Subscriptions</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((sub) => (
                <Card key={sub.id}>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      {sub.mentor.profileImage && (
                        <Image
                          src={sub.mentor.profileImage}
                          alt={sub.mentor.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{sub.mentor.name}</h3>
                        <p className="text-sm text-white/60 mb-1">{sub.plan.name}</p>
                        <p className="text-xs text-white/40 mb-3">
                          Next billing: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </p>
                        <Button href={`/subscription/${sub.id}`} variant="primary" size="sm">
                          View Subscription →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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
                <Button href="/">Browse Mentors</Button>
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
      </div>
    </section>
  );
}