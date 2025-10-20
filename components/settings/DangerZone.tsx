// components/settings/DangerZone.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import { signOut } from "next-auth/react";
import { toast } from "@/components/common/Toast";

export default function DangerZone() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete my account") {
      toast("Please type the confirmation text exactly", "error");
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      toast("Account deleted successfully", "success");
      
      // Sign out and redirect to home
      setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, 1000);
    } catch (err) {
      console.error("[DangerZone] Delete failed:", err);
      toast("Failed to delete account. Please contact support.", "error");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardContent>
          <h2 className="mb-2 text-lg font-semibold text-rose-300">Danger Zone</h2>
          <p className="mb-4 text-sm text-white/60">
            Once you delete your account, there is no going back. This will permanently delete
            your profile, saved mentors, bookings, and application history.
          </p>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="danger"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="grid gap-4">
          <div>
            <h2 className="text-xl font-semibold text-rose-300">Delete Account?</h2>
            <p className="mt-2 text-sm text-white/70">
              This action <strong>cannot be undone</strong>. This will permanently delete:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-white/70">
              <li>• Your profile and account data</li>
              <li>• All saved mentors</li>
              <li>• Booking history</li>
              <li>• Mentor application (if any)</li>
              <li>• Your mentor profile (if you&apos;re a mentor)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
            <p className="text-sm text-amber-200">
              ⚠️ <strong>Warning:</strong> Active bookings will be cancelled and refunds will be
              processed according to our refund policy.
            </p>
          </div>

          <div>
            <label htmlFor="confirm-delete" className="mb-2 block text-sm font-medium">
              Type <code className="rounded bg-white/10 px-1.5 py-0.5">delete my account</code> to
              confirm:
            </label>
            <Input
              id="confirm-delete"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="delete my account"
              disabled={isDeleting}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation.toLowerCase() !== "delete my account" || isDeleting}
              variant="danger"
              className="flex-1"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
            <Button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation("");
              }}
              variant="ghost"
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}