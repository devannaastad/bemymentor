// app/admin/disputes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import { AlertCircle, CheckCircle, Clock, DollarSign, MessageSquare, User } from "lucide-react";

interface Dispute {
  id: string;
  userId: string;
  mentorId: string;
  type: string;
  status: string;
  totalPrice: number;
  fraudReportedAt: string;
  fraudNotes: string | null;
  adminDecision: string | null;
  adminReviewedAt: string | null;
  adminReviewedBy: string | null;
  adminNotes: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  mentor: {
    id: string;
    name: string;
    userId: string;
    verifiedBookingsCount: number;
    isTrusted: boolean;
  };
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  }>;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [decision, setDecision] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [customRefundAmount, setCustomRefundAmount] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/disputes");
      const json = await res.json();
      if (json.ok) {
        setDisputes(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute || !decision) return;

    try {
      setResolving(true);

      const payload: {
        decision: string;
        adminNotes?: string;
        customRefundAmount?: number;
      } = {
        decision,
        adminNotes,
      };

      if (decision === "REFUND_STUDENT_PARTIAL" && customRefundAmount) {
        payload.customRefundAmount = Math.round(parseFloat(customRefundAmount) * 100);
      }

      const res = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.ok) {
        alert("Dispute resolved successfully!");
        setSelectedDispute(null);
        setDecision("");
        setAdminNotes("");
        setCustomRefundAmount("");
        fetchDisputes();
      } else {
        alert(`Failed to resolve dispute: ${json.error}`);
      }
    } catch (err) {
      console.error("Failed to resolve dispute:", err);
      alert("Failed to resolve dispute");
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <p>Loading disputes...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Dispute Management</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Disputes List */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Active Disputes ({disputes.length})</h2>
            </CardHeader>
            <CardContent>
              {disputes.length === 0 ? (
                <p className="text-muted-foreground">No active disputes</p>
              ) : (
                <div className="space-y-4">
                  {disputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        selectedDispute?.id === dispute.id
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                      onClick={() => setSelectedDispute(dispute)}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <span className="font-semibold">{dispute.type} Booking</span>
                        </div>
                        <span className="text-sm text-white/60">
                          ${(dispute.totalPrice / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="mb-1 text-sm text-white/80">
                        Student: {dispute.user.name || dispute.user.email}
                      </div>
                      <div className="mb-1 text-sm text-white/80">
                        Mentor: {dispute.mentor.name}{" "}
                        {dispute.mentor.isTrusted && (
                          <span className="text-green-400">(Trusted)</span>
                        )}
                      </div>
                      <div className="text-xs text-white/60">
                        Reported: {new Date(dispute.fraudReportedAt).toLocaleDateString()}
                      </div>
                      {dispute.adminDecision && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-400">
                            {dispute.adminDecision.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dispute Details & Resolution */}
        <div>
          {selectedDispute ? (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Dispute Details</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Booking Info */}
                  <div>
                    <h3 className="mb-2 font-semibold text-white/80">Booking Information</h3>
                    <div className="space-y-1 text-sm">
                      <div>ID: {selectedDispute.id}</div>
                      <div>Type: {selectedDispute.type}</div>
                      <div>Status: {selectedDispute.status}</div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Amount: ${(selectedDispute.totalPrice / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div>
                    <h3 className="mb-2 font-semibold text-white/80">Student</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedDispute.user.name || "Unknown"}
                      </div>
                      <div className="text-white/60">{selectedDispute.user.email}</div>
                    </div>
                  </div>

                  {/* Mentor Info */}
                  <div>
                    <h3 className="mb-2 font-semibold text-white/80">Mentor</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedDispute.mentor.name}
                      </div>
                      <div className="text-white/60">
                        Verified Bookings: {selectedDispute.mentor.verifiedBookingsCount}
                      </div>
                      <div>
                        {selectedDispute.mentor.isTrusted ? (
                          <span className="text-green-400">✓ Trusted Mentor</span>
                        ) : (
                          <span className="text-yellow-400">New Mentor</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fraud Notes */}
                  {selectedDispute.fraudNotes && (
                    <div>
                      <h3 className="mb-2 font-semibold text-white/80">Student&apos;s Report</h3>
                      <div className="rounded-lg bg-red-500/10 p-3 text-sm">
                        {selectedDispute.fraudNotes}
                      </div>
                    </div>
                  )}

                  {/* Chat Messages */}
                  {selectedDispute.messages.length > 0 && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 font-semibold text-white/80">
                        <MessageSquare className="h-4 w-4" />
                        Messages ({selectedDispute.messages.length})
                      </h3>
                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg bg-white/5 p-3">
                        {selectedDispute.messages.map((msg) => (
                          <div key={msg.id} className="text-sm">
                            <div className="text-xs text-white/60">
                              {msg.senderId === selectedDispute.userId ? "Student" : "Mentor"}:
                            </div>
                            <div className="text-white/90">{msg.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous Decision */}
                  {selectedDispute.adminDecision && (
                    <div className="rounded-lg bg-green-500/10 p-4">
                      <div className="mb-2 flex items-center gap-2 font-semibold text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        Previously Resolved
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>
                          Decision: {selectedDispute.adminDecision.replace(/_/g, " ")}
                        </div>
                        <div className="text-white/60">
                          By: {selectedDispute.adminReviewedBy}
                        </div>
                        <div className="text-white/60">
                          On: {new Date(selectedDispute.adminReviewedAt!).toLocaleString()}
                        </div>
                        {selectedDispute.adminNotes && (
                          <div className="mt-2 rounded bg-white/5 p-2">
                            {selectedDispute.adminNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Resolution Form */}
                  <div>
                    <h3 className="mb-3 font-semibold text-white/80">Resolve Dispute</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Decision</label>
                        <Select
                          value={decision}
                          onChange={(e) => setDecision(e.target.value)}
                        >
                          <option value="">Select decision...</option>
                          <option value="REFUND_STUDENT_FULL">
                            Refund Student Full Amount
                          </option>
                          <option value="REFUND_STUDENT_PARTIAL">
                            Refund Student Partial
                          </option>
                          <option value="PAYOUT_MENTOR_FULL">Payout Mentor Full</option>
                          <option value="SPLIT_50_50">Split 50/50</option>
                          <option value="UNDER_REVIEW">Mark Under Review</option>
                          <option value="NO_ACTION">No Action (Dismiss)</option>
                        </Select>
                      </div>

                      {decision === "REFUND_STUDENT_PARTIAL" && (
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Custom Refund Amount ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            max={(selectedDispute.totalPrice / 100).toFixed(2)}
                            value={customRefundAmount}
                            onChange={(e) => setCustomRefundAmount(e.target.value)}
                            className="h-12 w-full rounded-lg border-2 border-white/20 bg-neutral-900 px-4 text-white outline-none focus:border-primary-500"
                            placeholder={`Max: $${(selectedDispute.totalPrice / 100).toFixed(2)}`}
                          />
                        </div>
                      )}

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Admin Notes (Optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border-2 border-white/20 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-primary-500"
                          placeholder="Add any notes about this resolution..."
                        />
                      </div>

                      <Button
                        onClick={handleResolve}
                        disabled={!decision || resolving}
                        className="w-full"
                      >
                        {resolving ? "Resolving..." : "Resolve Dispute"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className="flex min-h-[400px] items-center justify-center text-center">
                  <div>
                    <Clock className="mx-auto mb-4 h-12 w-12 text-white/30" />
                    <p className="text-white/60">Select a dispute to view details</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
