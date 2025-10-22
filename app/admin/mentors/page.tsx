// app/admin/mentors/page.tsx
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { requireAdmin } from "@/lib/admin";
import { formatCurrency } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminMentorsPage() {
  const session = await requireAdmin();

  const mentors = await db.mentor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      bookings: {
        select: {
          id: true,
          totalPrice: true,
          status: true,
        },
      },
    },
  });

  return (
    <section className="section">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="h1">Mentor Management</h1>
            <p className="mt-1 text-sm text-white/60">
              Signed in as: {session?.user?.email}
            </p>
          </div>
          <Badge variant="outline">Total: {mentors.length}</Badge>
        </div>

        {/* Mentors List */}
        <div className="grid gap-4">
          {mentors.length === 0 ? (
            <Card>
              <CardContent>
                <p className="muted">No mentors found.</p>
              </CardContent>
            </Card>
          ) : (
            mentors.map((mentor) => {
              const completedBookings = mentor.bookings.filter(
                (b) => b.status === "COMPLETED"
              );
              const totalEarnings = completedBookings.reduce(
                (sum, b) => sum + b.totalPrice,
                0
              );

              return (
                <Card key={mentor.id}>
                  <CardContent>
                    <div className="flex items-start justify-between gap-4">
                      {/* Mentor Info */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">{mentor.name}</h3>
                          <Badge
                            variant={mentor.isActive ? "success" : "default"}
                          >
                            {mentor.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            {mentor.category}
                          </Badge>
                        </div>

                        <p className="text-sm text-white/70 mb-1">
                          {mentor.tagline}
                        </p>

                        <p className="text-xs text-white/50 mb-3 truncate">
                          {mentor.user.email}
                        </p>

                        {/* Stats */}
                        <div className="grid gap-3 sm:grid-cols-3 text-sm">
                          <div>
                            <p className="text-xs text-white/60">Rating</p>
                            <p className="font-medium">
                              ⭐ {mentor.rating.toFixed(1)} ({mentor.reviews} reviews)
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-white/60">Bookings</p>
                            <p className="font-medium">
                              {mentor.bookings.length} total • {completedBookings.length}{" "}
                              completed
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-white/60">Earnings</p>
                            <p className="font-medium">
                              {formatCurrency(totalEarnings / 100)}
                            </p>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="mt-3 flex gap-3 text-sm">
                          {mentor.accessPrice && (
                            <div>
                              <span className="text-white/60">ACCESS:</span>{" "}
                              <span className="font-medium">
                                {formatCurrency(mentor.accessPrice)}
                              </span>
                            </div>
                          )}
                          {mentor.hourlyRate && (
                            <div>
                              <span className="text-white/60">TIME:</span>{" "}
                              <span className="font-medium">
                                {formatCurrency(mentor.hourlyRate)}/hr
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          href={`/mentors/${mentor.id}`}
                          variant="ghost"
                          size="sm"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
