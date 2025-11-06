"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/common/Card";
import EarningsChart from "./EarningsChart";
import Image from "next/image";

interface AnalyticsData {
  earningsByMonth: Array<{
    month: string;
    earnings: number;
    sessions: number;
  }>;
  stats: {
    totalEarnings: number;
    pendingEarnings: number;
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    averageRating: number;
    totalReviews: number;
  };
  topStudents: Array<{
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
    sessionCount: number;
    totalSpent: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/mentor/analytics");
        const result = await res.json();

        if (result.ok) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-center text-rose-200">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Earnings */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Earnings</p>
                <p className="text-3xl font-bold text-emerald-400">
                  ${data.stats.totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Earnings */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Pending</p>
                <p className="text-3xl font-bold text-amber-400">
                  ${data.stats.pendingEarnings.toFixed(2)}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Completion Rate</p>
                <p className="text-3xl font-bold">{data.stats.completionRate}%</p>
                <p className="text-xs text-white/40">
                  {data.stats.completedSessions} of {data.stats.totalSessions} sessions
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : "N/A"}
                </p>
                <p className="text-xs text-white/40">{data.stats.totalReviews} reviews</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardContent>
          <h2 className="mb-6 text-xl font-semibold">Earnings Over Time</h2>
          <EarningsChart data={data.earningsByMonth} />
        </CardContent>
      </Card>

      {/* Top Students */}
      {data.topStudents.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="mb-4 text-xl font-semibold">Top Students</h2>
            <div className="space-y-3">
              {data.topStudents.map((student, index) => (
                <div
                  key={student.user.id}
                  className="flex items-center justify-between rounded-lg bg-white/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-300">
                      #{index + 1}
                    </div>
                    {student.user.image ? (
                      <Image
                        src={student.user.image}
                        alt={student.user.name || "Student"}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
                        👤
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{student.user.name || "Anonymous"}</p>
                      <p className="text-xs text-white/60">{student.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{student.sessionCount} sessions</p>
                    <p className="text-sm text-white/60">${student.totalSpent.toFixed(2)} spent</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
