import { MentorAnalytics } from "@/lib/analytics";
import AnalyticsCard from "./AnalyticsCard";
import {
  DollarSign,
  Calendar,
  CheckCircle,
  Users,
  Star,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";

interface MentorAnalyticsDashboardProps {
  analytics: MentorAnalytics;
}

export default function MentorAnalyticsDashboard({
  analytics,
}: MentorAnalyticsDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Total Earnings"
            value={`$${(analytics.totalEarnings / 100).toFixed(2)}`}
            icon={DollarSign}
            subtitle="All-time"
          />
          <AnalyticsCard
            title="Total Bookings"
            value={analytics.totalBookings}
            icon={Calendar}
            subtitle={`${analytics.completedSessions} completed`}
          />
          <AnalyticsCard
            title="Average Rating"
            value={analytics.averageRating.toFixed(1)}
            icon={Star}
            subtitle={`From ${analytics.totalReviews} reviews`}
          />
          <AnalyticsCard
            title="Upcoming Sessions"
            value={analytics.upcomingSessions}
            icon={Clock}
            subtitle={`${analytics.pendingBookings} pending`}
          />
        </div>
      </div>

      {/* Active Stats */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Active Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnalyticsCard
            title="Active ACCESS Passes"
            value={analytics.activeAccessPasses}
            icon={Users}
            subtitle="Current subscribers"
          />
          <AnalyticsCard
            title="Completed Sessions"
            value={analytics.completedSessions}
            icon={CheckCircle}
            subtitle="1-on-1 sessions"
          />
          <AnalyticsCard
            title="Pending Bookings"
            value={analytics.pendingBookings}
            icon={AlertCircle}
            subtitle="Awaiting confirmation"
          />
        </div>
      </div>

      {/* Earnings Chart */}
      {analytics.earningsByMonth.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            Earnings (Last 6 Months)
          </h3>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {analytics.earningsByMonth.map((item) => (
                  <div key={item.month} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-white/60">
                      {item.month}
                    </div>
                    <div className="flex-1 bg-white/10 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full flex items-center justify-end pr-3"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.earnings / Math.max(...analytics.earningsByMonth.map((i) => i.earnings))) * 100
                          )}%`,
                        }}
                      >
                        <span className="text-xs font-medium text-black">
                          ${(item.earnings / 100).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Bookings */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Recent Bookings</h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-white/10">
              {analytics.recentBookings.length === 0 ? (
                <div className="p-8 text-center text-white/60">
                  No bookings yet
                </div>
              ) : (
                analytics.recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">
                            {booking.user.name || "Anonymous"}
                          </span>
                          <Badge
                            variant={
                              booking.status === "CONFIRMED"
                                ? "success"
                                : booking.status === "COMPLETED"
                                ? "default"
                                : booking.status === "PENDING"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-white/60">
                          {booking.type === "ACCESS"
                            ? "ACCESS Pass"
                            : "1-on-1 Session"}
                          {booking.scheduledAt && (
                            <span className="ml-2">
                              •{" "}
                              {new Date(booking.scheduledAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary-400">
                          ${(booking.totalPrice / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
