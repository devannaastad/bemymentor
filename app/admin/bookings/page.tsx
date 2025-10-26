// app/admin/bookings/page.tsx
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import { requireAdmin } from "@/lib/admin";
import { formatCurrency } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const session = await requireAdmin();

  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      mentor: {
        select: {
          name: true,
        },
      },
    },
    take: 100,
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <section className="section">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="h1">Booking Management</h1>
            <p className="mt-1 text-sm text-white/60">
              Signed in as: {session?.user?.email}
            </p>
          </div>
          <Badge variant="outline">Total: {stats.total}</Badge>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-5">
          <Card>
            <CardContent>
              <p className="text-sm text-white/60">Pending</p>
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-white/60">Confirmed</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.confirmed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-white/60">Completed</p>
              <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-white/60">Cancelled</p>
              <p className="text-2xl font-bold text-rose-400">{stats.cancelled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-white/60">Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <div className="grid gap-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent>
                <p className="muted">No bookings found.</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold">
                          {booking.user.name || booking.user.email}
                        </h3>
                        <span className="text-white/60">→</span>
                        <h3 className="text-base font-semibold">
                          {booking.mentor.name}
                        </h3>
                      </div>

                      <div className="mb-3 flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            booking.status === "CONFIRMED"
                              ? "success"
                              : booking.status === "PENDING"
                              ? "warning"
                              : booking.status === "COMPLETED"
                              ? "default"
                              : "danger"
                          }
                        >
                          {booking.status}
                        </Badge>
                        <Badge variant="outline">
                          {booking.type}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="grid gap-2 text-sm">
                        <div className="flex gap-4">
                          <span className="text-white/60">Amount:</span>
                          <span className="font-medium">
                            {formatCurrency(booking.totalPrice)}
                          </span>
                        </div>
                        {booking.scheduledAt && (
                          <div className="flex gap-4">
                            <span className="text-white/60">Scheduled:</span>
                            <span>
                              {new Date(booking.scheduledAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {booking.durationMinutes && (
                          <div className="flex gap-4">
                            <span className="text-white/60">Duration:</span>
                            <span>{booking.durationMinutes} minutes</span>
                          </div>
                        )}
                        {booking.notes && (
                          <div className="flex gap-4">
                            <span className="text-white/60">Notes:</span>
                            <span className="text-white/70">{booking.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-right text-xs text-white/50">
                      <p>{new Date(booking.createdAt).toLocaleDateString()}</p>
                      <p>{new Date(booking.createdAt).toLocaleTimeString()}</p>
                      {booking.stripePaidAt && (
                        <p className="mt-1 text-emerald-400">
                          Paid: {new Date(booking.stripePaidAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
