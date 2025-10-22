"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import Textarea from "@/components/common/Textarea";
import FormFieldError from "@/components/common/FormFieldError";

interface BookingVerificationProps {
  bookingId: string;
  mentorName: string;
  isVerified: boolean;
  isFraudReported: boolean;
}

export default function BookingVerification({
  bookingId,
  mentorName,
  isVerified,
  isFraudReported,
}: BookingVerificationProps) {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [reportingFraud, setReportingFraud] = useState(false);
  const [showFraudForm, setShowFraudForm] = useState(false);
  const [fraudReason, setFraudReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Already handled states
  if (isVerified) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="text-3xl">✅</div>
            <div>
              <h3 className="font-semibold text-emerald-200">Booking Verified</h3>
              <p className="text-sm text-white/60">
                Thank you for confirming this was a legitimate session!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isFraudReported) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-rose-200">Fraud Reported</h3>
              <p className="text-sm text-white/60">
                Our team is reviewing your report and will contact you within 24 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleVerify = async () => {
    setVerifying(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/bookings/${bookingId}/verify`, {
        method: "POST",
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Failed to verify booking");
        return;
      }

      setSuccess(data.message || "Booking verified successfully!");
      router.refresh();
    } catch (err) {
      console.error("Verification error:", err);
      setError("An unexpected error occurred");
    } finally {
      setVerifying(false);
    }
  };

  const handleReportFraud = async () => {
    if (!fraudReason.trim() || fraudReason.length < 10) {
      setError("Please provide a detailed reason (minimum 10 characters)");
      return;
    }

    setReportingFraud(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/bookings/${bookingId}/report-fraud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: fraudReason }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Failed to report fraud");
        return;
      }

      setSuccess(data.message || "Fraud reported successfully");
      setShowFraudForm(false);
      router.refresh();
    } catch (err) {
      console.error("Fraud report error:", err);
      setError("An unexpected error occurred");
    } finally {
      setReportingFraud(false);
    }
  };

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardContent>
        {!showFraudForm ? (
          <>
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">🛡️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-200 mb-1">
                    Verification Required
                  </h3>
                  <p className="text-sm text-white/70">
                    To help us prevent scams and protect our community, please confirm
                    whether your session with <strong>{mentorName}</strong> was legitimate.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                <p className="text-sm text-white/80 mb-2">
                  <strong>Why verify?</strong>
                </p>
                <ul className="text-sm text-white/60 space-y-1 list-disc list-inside">
                  <li>Helps build trust in our platform</li>
                  <li>Protects other users from scammers</li>
                  <li>New mentors need 5 verifications before receiving payouts</li>
                  <li>Your verification enables faster payouts for legitimate mentors</li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="mb-4">
                <FormFieldError error={error} />
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {success}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={handleVerify}
                variant="primary"
                loading={verifying}
                disabled={reportingFraud}
                className="w-full"
              >
                ✓ Verify - Session Was Legit
              </Button>
              <Button
                onClick={() => setShowFraudForm(true)}
                variant="danger"
                disabled={verifying}
                className="w-full"
              >
                ⚠️ Report Fraud/Scam
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="font-semibold text-rose-200 mb-2">Report Fraud</h3>
              <p className="text-sm text-white/60 mb-4">
                Please provide details about what happened. Your report will be reviewed by
                our team and appropriate action will be taken.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="fraudReason" className="block text-sm font-medium text-white/80 mb-2">
                    What happened? <span className="text-rose-400">*</span>
                  </label>
                  <Textarea
                    id="fraudReason"
                    value={fraudReason}
                    onChange={(e) => setFraudReason(e.target.value)}
                    placeholder="Describe the issue in detail... (e.g., 'Mentor never showed up', 'Mentor provided wrong information', 'No value delivered', etc.)"
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-white/40 mt-1">
                    {fraudReason.length}/1000 characters (minimum 10)
                  </p>
                </div>

                {error && <FormFieldError error={error} />}

                {success && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                    {success}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={handleReportFraud}
                    variant="danger"
                    loading={reportingFraud}
                    disabled={verifying}
                    className="w-full"
                  >
                    Submit Fraud Report
                  </Button>
                  <Button
                    onClick={() => {
                      setShowFraudForm(false);
                      setFraudReason("");
                      setError("");
                    }}
                    variant="ghost"
                    disabled={reportingFraud}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
