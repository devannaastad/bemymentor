"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import Modal from "@/components/common/Modal";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface StudentConfirmationProps {
  bookingId: string;
  mentorName: string;
  mentorCompletedAt: Date | null;
  studentConfirmedAt: Date | null;
  autoConfirmAt: Date | null;
  isFraudReported: boolean;
}

export default function StudentConfirmation({
  bookingId,
  mentorName,
  mentorCompletedAt,
  studentConfirmedAt,
  autoConfirmAt,
  isFraudReported,
}: StudentConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [fraudNotes, setFraudNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // If not completed by mentor yet, don't show anything
  if (!mentorCompletedAt) {
    return null;
  }

  // If already confirmed by student
  if (studentConfirmedAt) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <h3 className="font-semibold text-green-200">Session Confirmed</h3>
              <p className="text-sm text-white/60">
                You confirmed this session on {new Date(studentConfirmedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If fraud reported
  if (isFraudReported) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-200">Fraud Report Submitted</h3>
              <p className="text-sm text-white/60">
                Our team is reviewing your report. We&apos;ll be in touch soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate time remaining until auto-confirm
  const getTimeRemaining = () => {
    if (!autoConfirmAt) return null;
    const now = new Date();
    const diff = new Date(autoConfirmAt).getTime() - now.getTime();
    if (diff <= 0) return "Auto-confirming...";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes`;
    }
    return `${hours} hours`;
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/student-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm session");
      }

      window.location.reload();
    } catch (err) {
      console.error("Failed to confirm:", err);
      setError(err instanceof Error ? err.message : "Failed to confirm session");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReportFraud = async () => {
    if (!fraudNotes.trim()) {
      setError("Please provide details about the issue");
      return;
    }

    setIsConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/student-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "report_fraud", fraudNotes }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to report fraud");
      }

      setShowFraudModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to report fraud:", err);
      setError(err instanceof Error ? err.message : "Failed to report fraud");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent>
          <div className="mb-4">
            <h3 className="mb-2 text-lg font-semibold text-amber-200">
              Please Confirm Your Session
            </h3>
            <p className="text-sm text-white/70">
              {mentorName} has marked this session as completed. Please confirm that the
              session took place and was satisfactory.
            </p>
            {autoConfirmAt && (
              <p className="mt-2 text-xs text-white/50">
                Auto-confirms in {getTimeRemaining()} if you don&apos;t respond
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleConfirm}
              disabled={isConfirming}
              variant="primary"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isConfirming ? "Confirming..." : "Confirm Session"}
            </Button>
            <Button
              onClick={() => setShowFraudModal(true)}
              disabled={isConfirming}
              variant="ghost"
              className="text-red-400 hover:bg-red-500/10"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal open={showFraudModal} onClose={() => setShowFraudModal(false)}>
        <h3 className="mb-4 text-lg font-semibold text-white">Report Session Issue</h3>
        <p className="mb-4 text-sm text-white/70">
          Please describe what went wrong with this session. Our team will review your
          report and take appropriate action.
        </p>
        <textarea
          value={fraudNotes}
          onChange={(e) => setFraudNotes(e.target.value)}
          placeholder="Describe the issue in detail..."
          className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          rows={4}
        />
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => {
              setShowFraudModal(false);
              setError(null);
              setFraudNotes("");
            }}
            variant="ghost"
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReportFraud}
            variant="primary"
            disabled={isConfirming || !fraudNotes.trim()}
          >
            {isConfirming ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
