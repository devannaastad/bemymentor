// app/mentor-dashboard/calendar/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import { Calendar, Clock, User, Video, DollarSign } from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import Badge from "@/components/common/Badge";
import Image from "next/image";

export default async function MentorCalendarPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Get mentor profile
  const mentor = await db.mentor.findUnique({
    where: { userId: session.user.id },
  });

  if (!mentor) {
    redirect("/mentor-dashboard");
  }

  // Fetch upcoming bookings for the next 3 months
  const today = new Date();
  const threeMonthsFromNow = addMonths(today, 3);

  const bookings = await db.booking.findMany({
    where: {
      mentorId: mentor.id,
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      scheduledAt: {
        gte: today,
        lte: threeMonthsFromNow,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  // Get stats
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);

  const thisMonthBookings = await db.booking.count({
    where: {
      mentorId: mentor.id,
      status: { in: ["CONFIRMED", "COMPLETED"] },
      scheduledAt: {
        gte: thisMonthStart,
        lte: thisMonthEnd,
      },
    },
  });

  const thisMonthEarnings = await db.booking.aggregate({
    where: {
      mentorId: mentor.id,
      status: { in: ["CONFIRMED", "COMPLETED"] },
      scheduledAt: {
        gte: thisMonthStart,
        lte: thisMonthEnd,
      },
    },
    _sum: {
      mentorPayout: true,
    },
  });

  const totalEarnings = (thisMonthEarnings._sum.mentorPayout || 0) / 100;

  return (
    <div className="section">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="h1 mb-2">My Calendar</h1>
          <p className="text-white/60">View and manage your upcoming sessions</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-500/20 p-3">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Total Upcoming</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/20 p-3">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">This Month</p>
                <p className="text-2xl font-bold">{thisMonthBookings}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="rounded-lg bg-emerald-500/20 p-3">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Month Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-500/20 p-3">
                <User className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Unique Students</p>
                <p className="text-2xl font-bold">
                  {new Set(bookings.map((b) => b.userId)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mb-4 text-6xl">📅</div>
              <h3 className="mb-2 text-xl font-semibold">No Upcoming Sessions</h3>
              <p className="text-white/60">
                Your calendar is clear. Students can book sessions with you anytime.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <h2 className="mb-6 text-xl font-semibold">Upcoming Sessions</h2>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-center gap-4">
                      {/* User Avatar */}
                      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white/10">
                        {booking.user.image ? (
                          <Image
                            src={booking.user.image}
                            alt={booking.user.name || "Student"}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-white/40">
                            {(booking.user.name || booking.user.email)?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Session Details */}
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold">{booking.user.name || "Student"}</h3>
                          <Badge
                            variant={
                              booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                                ? "success"
                                : "warning"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {booking.scheduledAt &&
                              format(new Date(booking.scheduledAt), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.scheduledAt &&
                              format(new Date(booking.scheduledAt), "h:mm a")}
                          </span>
                          <span>{booking.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-white/60">Your Earnings</p>
                        <p className="font-semibold">
                          ${((booking.mentorPayout || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                      {booking.meetingLink && (
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                        >
                          <Video className="h-4 w-4" />
                          Join
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
