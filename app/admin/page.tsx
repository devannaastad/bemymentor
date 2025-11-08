// app/admin/page.tsx
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { requireAdmin } from "@/lib/admin";
import { formatCurrency } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Fetch all stats in parallel
  const [
    totalUsers,
    totalMentors,
    activeMentors,
    totalBookings,
    pendingApplications,
    recentBookings,
    recentUsers,
    revenue,
  ] = await Promise.all([
    db.user.count(),
    db.mentor.count(),
    db.mentor.count({ where: { isActive: true } }),
    db.booking.count(),
    db.application.count({ where: { status: "PENDING" } }),
    db.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        mentor: { select: { name: true } },
      },
    }),
    db.user.findMany({
      take: 5,
      orderBy: { id: "desc" },
    }),
    db.booking.aggregate({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      _sum: { totalPrice: true },
    }),
  ]);

  const bookingsByStatus = await db.booking.groupBy({
    by: ["status"],
    _count: true,
  });

  const totalRevenue = revenue._sum.totalPrice || 0;

  return (
    <section className="section">
      <div className="container">
        <div className="mb-6">
          <h1 className="h1">Admin Dashboard</h1>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Users</p>
                  <p className="text-3xl font-bold">{totalUsers}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Active Mentors</p>
                  <p className="text-3xl font-bold">
                    {activeMentors}
                    <span className="text-sm text-white/40 ml-1">/{totalMentors}</span>
                  </p>
                </div>
                <div className="text-4xl">👨‍🏫</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Bookings</p>
                  <p className="text-3xl font-bold">{totalBookings}</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Revenue</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {pendingApplications > 0 && (
          <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-200">
                    {pendingApplications} Pending Application{pendingApplications !== 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-white/60">
                    New mentor applications waiting for review
                  </p>
                </div>
                <Button href="/admin/applications" variant="primary">
                  Review Now →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Status Overview */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {bookingsByStatus.map((status) => (
            <Card key={status.status}>
              <CardContent>
                <p className="text-sm text-white/60 capitalize">
                  {status.status.toLowerCase()}
                </p>
                <p className="text-2xl font-bold">{status._count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Bookings */}
          <Card>
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Recent Bookings</h2>
              {recentBookings.length === 0 ? (
                <p className="text-sm text-white/60">No bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {booking.user.name || booking.user.email}
                        </p>
                        <p className="text-xs text-white/60">
                          {booking.mentor.name} • {booking.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            booking.status === "CONFIRMED"
                              ? "success"
                              : booking.status === "PENDING"
                              ? "warning"
                              : "default"
                          }
                        >
                          {booking.status}
                        </Badge>
                        <span className="text-sm font-medium">
                          {formatCurrency(booking.totalPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Recent Users</h2>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-white/60">No users yet</p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name || "No name"}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {user.email}
                        </p>
                      </div>
                      {user.emailVerified && (
                        <Badge variant="success">
                          Verified
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
