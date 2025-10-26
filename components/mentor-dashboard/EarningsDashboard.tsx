"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, ExternalLink, Shield } from "lucide-react";

interface EarningsData {
  stats: {
    lifetimeEarnings: number;
    lifetimePlatformFees: number;
    thisMonthEarnings: number;
    totalPaidOut: number;
    pendingEarnings: number;
    totalBookings: number;
    paidOutCount: number;
    pendingCount: number;
  };
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
    bookingCount: number;
  }>;
  recentPayouts: Array<{
    id: string;
    amount: number;
    platformFee: number;
    totalPrice: number;
    payoutId: string | null;
    paidAt: Date | null;
    bookingType: string;
    customerName: string;
    scheduledAt: Date | null;
  }>;
  pendingPayouts: Array<{
    id: string;
    amount: number;
    platformFee: number;
    totalPrice: number;
    status: string;
    payoutStatus?: string;
    releaseDate?: Date;
    bookingType: string;
    customerName: string;
    scheduledAt: Date | null;
    paidByCustomerAt: Date | null;
  }>;
  stripeConnected: boolean;
  stripeAccountId: string | null;
  isTrusted: boolean;
  verifiedBookingsCount: number;
  trustThreshold: number;
}

export default function EarningsDashboard() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  async function fetchEarningsData() {
    try {
      const res = await fetch("/api/mentor/earnings");
      const json = await res.json();

      if (json.ok) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load earnings data");
      }
    } catch (err) {
      console.error("Failed to fetch earnings:", err);
      setError("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  }

  async function openStripeDashboard() {
    try {
      const res = await fetch("/api/mentor/stripe-connect", { method: "POST" });
      const json = await res.json();

      if (json.ok && json.data.url) {
        window.open(json.data.url, "_blank");
      }
    } catch (err) {
      console.error("Failed to open Stripe dashboard:", err);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <p className="text-rose-200">{error || "Failed to load earnings"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Stripe Connection Warning */}
      {!data.stripeConnected && (
        <Card className="border-amber-500/20 bg-amber-500/10">
          <CardContent>
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-200 mb-1">
                  Connect Stripe to Receive Payouts
                </h3>
                <p className="text-sm text-amber-100/70 mb-3">
                  You need to connect your Stripe account to receive earnings from your bookings.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openStripeDashboard}
                  className="gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Connect Stripe Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Status Banner */}
      {!data.isTrusted && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-400">New Mentor - Trust Period</h3>
                <p className="text-sm text-white/70 mt-1">
                  You&apos;ve completed {data.verifiedBookingsCount} of {data.trustThreshold} verified bookings.
                  Payouts are held for 7 days to prevent fraud. After {data.trustThreshold} verified bookings,
                  you&apos;ll become a trusted mentor and receive instant payouts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.isTrusted && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-400">Trusted Mentor Status</h3>
                <p className="text-sm text-white/70 mt-1">
                  Congratulations! You&apos;ve earned trusted status with {data.verifiedBookingsCount} verified bookings.
                  You now receive instant payouts when bookings are completed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Lifetime Earnings</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {formatCurrency(data.stats.lifetimeEarnings)}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {data.stats.totalBookings} bookings
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-emerald-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">This Month</p>
                <p className="text-3xl font-bold text-primary-400">
                  {formatCurrency(data.stats.thisMonthEarnings)}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {data.monthlyEarnings[data.monthlyEarnings.length - 1]?.bookingCount || 0} bookings
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Paid Out</p>
                <p className="text-3xl font-bold text-blue-400">
                  {formatCurrency(data.stats.totalPaidOut)}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {data.stats.paidOutCount} transfers
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Pending</p>
                <p className="text-3xl font-bold text-amber-400">
                  {formatCurrency(data.stats.pendingEarnings)}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {data.stats.pendingCount} bookings
                </p>
              </div>
              <Clock className="h-10 w-10 text-amber-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Earnings Chart */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Monthly Earnings</h3>
            {data.stripeConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={openStripeDashboard}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Stripe Dashboard
              </Button>
            )}
          </div>

          {/* Simple bar chart */}
          <div className="space-y-4">
            {data.monthlyEarnings.map((month) => {
              const maxEarnings = Math.max(...data.monthlyEarnings.map((m) => m.earnings), 1);
              const percentage = (month.earnings / maxEarnings) * 100;

              return (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">{month.month}</span>
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(month.earnings)}
                    </span>
                  </div>
                  <div className="h-8 w-full rounded-lg bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    {month.bookingCount} {month.bookingCount === 1 ? "booking" : "bookings"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout for payouts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Payouts */}
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Recent Payouts</h3>

            {data.recentPayouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60">No payouts yet</p>
                <p className="text-sm text-white/40 mt-1">
                  Payouts will appear here after bookings are completed
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white">{payout.customerName}</p>
                        <p className="text-sm text-white/60">
                          {payout.bookingType === "ACCESS" ? "ACCESS Pass" : "1-on-1 Session"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">
                          {formatCurrency(payout.amount)}
                        </p>
                        <Badge variant="success" className="text-xs">
                          Paid Out
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>
                        {payout.paidAt
                          ? new Date(payout.paidAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Processing"}
                      </span>
                      {payout.payoutId && (
                        <span className="font-mono">{payout.payoutId.slice(-8)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Pending Payouts</h3>

            {data.pendingPayouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60">No pending payouts</p>
                <p className="text-sm text-white/40 mt-1">
                  Bookings awaiting completion will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.pendingPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white">{payout.customerName}</p>
                        <p className="text-sm text-white/60">
                          {payout.bookingType === "ACCESS" ? "ACCESS Pass" : "1-on-1 Session"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-400">
                          {formatCurrency(payout.amount)}
                        </p>
                        <Badge variant="warning" className="text-xs">
                          {payout.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">
                      <p>
                        Paid by customer:{" "}
                        {payout.paidByCustomerAt
                          ? new Date(payout.paidByCustomerAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                      {payout.payoutStatus === "HELD" && payout.releaseDate && (
                        <p className="mt-1 text-amber-400/70">
                          Held until{" "}
                          {new Date(payout.releaseDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          (anti-fraud protection)
                        </p>
                      )}
                      {payout.bookingType === "SESSION" && payout.status !== "COMPLETED" && (
                        <p className="mt-1 text-amber-400/70">
                          Mark as completed to release payout
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Fee Info */}
      <Card className="border-white/10 bg-white/5">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary-500/20 p-3">
              <DollarSign className="h-6 w-6 text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Platform Fee: 15%</h3>
              <p className="text-sm text-white/60 mb-2">
                We charge a 15% platform fee on all bookings. You keep 85% of every payment.
              </p>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Total booking revenue:</span>
                  <span className="font-semibold">
                    {formatCurrency(data.stats.lifetimeEarnings + data.stats.lifetimePlatformFees)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Platform fees (15%):</span>
                  <span className="font-semibold text-white/80">
                    -{formatCurrency(data.stats.lifetimePlatformFees)}
                  </span>
                </div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-white">Your earnings (85%):</span>
                  <span className="font-bold text-emerald-400 text-lg">
                    {formatCurrency(data.stats.lifetimeEarnings)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
