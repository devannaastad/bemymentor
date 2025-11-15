"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-white/60">
        Update your password to keep your account secure. Make sure to use a strong, unique password.
      </p>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
          <p className="text-sm text-emerald-200">{success}</p>
        </div>
      )}

      {/* Current Password */}
      <div>
        <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-white/90">
          Current Password
        </label>
        <div className="relative">
          <input
            id="current-password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 pr-12 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="Enter current password"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-white/90">
          New Password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 pr-12 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="Enter new password (min 6 characters)"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
            {showNewPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm New Password */}
      <div>
        <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-white/90">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 pr-12 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="Re-enter new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
      >
        {loading ? "Changing Password..." : "Change Password"}
      </Button>
    </form>
  );
}
