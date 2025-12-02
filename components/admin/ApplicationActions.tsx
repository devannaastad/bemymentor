// components/admin/ApplicationActions.tsx
"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import { useRouter } from "next/navigation";

type Status = "PENDING" | "APPROVED" | "REJECTED";

export default function ApplicationActions({
  applicationId,
  currentStatus,
  currentNotes,
}: {
  applicationId: string;
  currentStatus: Status;
  currentNotes?: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(currentNotes || "");
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: Status) {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes: notes.trim() || undefined,
          reviewedBy: "admin@bemymentor.co", // TODO: Use actual admin email from session
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      alert(`Application ${status.toLowerCase()} successfully!`);
      router.refresh();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update application. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveNotes() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to save notes");
      }

      alert("Notes saved!");
      router.refresh();
    } catch (error) {
      console.error("Save notes failed:", error);
      alert("Failed to save notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      {/* Action Buttons */}
      {currentStatus === "PENDING" && (
        <div className="flex gap-2">
          <Button
            onClick={() => updateStatus("APPROVED")}
            disabled={loading}
            variant="primary"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
          >
            ✓ Approve
          </Button>
          <Button
            onClick={() => updateStatus("REJECTED")}
            disabled={loading}
            variant="danger"
            className="flex-1"
          >
            ✗ Reject
          </Button>
        </div>
      )}

      {currentStatus === "APPROVED" && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-200">
          ✓ This application has been approved and a mentor profile was created.
        </div>
      )}

      {currentStatus === "REJECTED" && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-200">
          ✗ This application has been rejected.
        </div>
      )}

      {/* Notes Section */}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-white/80">Admin Notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this application..."
          rows={4}
        />
        <Button onClick={saveNotes} disabled={loading} variant="ghost" size="sm">
          Save Notes
        </Button>
      </div>
    </div>
  );
}