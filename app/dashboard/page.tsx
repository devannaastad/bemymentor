// app/dashboard/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import MentorCard from "@/components/catalog/MentorCard";

export const dynamic = "force-dynamic";

async function getDashboardData(email: string) {
  const [savedMentors, application] = await Promise.all([
    // Get saved mentors
    db.savedMentor
      .findMany({
        where: { user: { email } },
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
  ]);

  return { savedMentors, application };
}

export default async function DashboardPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const { savedMentors, application } = await getDashboardData(email);

  const userName = session.user?.name?.split(" ")[0] || "there";

  return (
    <section className="section">
      <div className="container">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="h1 mb-2">Welcome back, {userName}!</h1>
          <p className="text-white/60">Here&apos;s what&apos;s happening with your mentorship journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
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
                  <p className="text-sm text-white/60">Active Sessions</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
              <p className="mt-2 text-xs text-white/50">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Hours Learned</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="text-4xl">⏱️</div>
              </div>
              <p className="mt-2 text-xs text-white/50">Coming soon</p>
            </CardContent>
          </Card>
        </div>

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

                  {application.status === "APPROVED" && (
                    <div className="mt-3">
                      <p className="text-sm text-emerald-300">
                        Congratulations! Your application has been approved.
                      </p>
                      <Button href="/mentor-setup" className="mt-3" variant="primary">
                        Complete Setup →
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