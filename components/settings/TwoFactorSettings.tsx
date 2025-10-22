"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Image from "next/image";

interface TwoFactorSettingsProps {
  initialEnabled: boolean;
}

export default function TwoFactorSettings({ initialEnabled }: TwoFactorSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Setup state
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyToken, setVerifyToken] = useState("");
  const [step, setStep] = useState<"qr" | "verify" | "backup">("qr");

  // Disable state
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  const handleSetupStart = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/2fa/setup", {
        method: "POST",
      });

      const data = await res.json();

      if (data.ok) {
        setQrCode(data.data.qrCode);
        setSecret(data.data.secret);
        setBackupCodes(data.data.backupCodes);
        setShowSetup(true);
        setStep("qr");
      } else {
        setError(data.error || "Failed to setup 2FA");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          token: verifyToken,
          backupCodes,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setStep("backup");
        setSuccess("2FA enabled successfully!");
      } else {
        setError(data.error || "Invalid code");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSetup = () => {
    setEnabled(true);
    setShowSetup(false);
    setStep("qr");
    setVerifyToken("");
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await res.json();

      if (data.ok) {
        setEnabled(false);
        setShowDisable(false);
        setDisablePassword("");
        setSuccess("2FA disabled successfully");
      } else {
        setError(data.error || "Failed to disable 2FA");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
          <p className="mt-1 text-sm text-white/60">
            Add an extra layer of security to your account
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            enabled
              ? "bg-emerald-500/20 text-emerald-200"
              : "bg-white/10 text-white/60"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      {!enabled && !showSetup && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <p className="mb-4 text-sm text-white/80">
            Enable two-factor authentication to protect your account with an authenticator
            app like Google Authenticator, Authy, or 1Password.
          </p>
          <Button onClick={handleSetupStart} disabled={loading} variant="primary">
            {loading ? "Setting up..." : "Enable 2FA"}
          </Button>
        </div>
      )}

      {enabled && !showDisable && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-6">
          <p className="mb-4 text-sm text-emerald-100">
            Two-factor authentication is currently enabled on your account.
          </p>
          <Button onClick={() => setShowDisable(true)} variant="secondary">
            Disable 2FA
          </Button>
        </div>
      )}

      {/* Setup Flow */}
      {showSetup && step === "qr" && (
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-6">
          <h4 className="mb-4 font-semibold text-purple-100">
            Step 1: Scan QR Code
          </h4>
          <p className="mb-4 text-sm text-purple-100/80">
            Scan this QR code with your authenticator app:
          </p>
          <div className="mb-4 flex justify-center">
            <div className="rounded-lg bg-white p-4">
              <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
            </div>
          </div>
          <p className="mb-2 text-xs text-purple-100/60">
            Or enter this code manually:
          </p>
          <div className="mb-4 rounded-lg bg-black/20 p-3">
            <code className="text-sm text-purple-100">{secret}</code>
          </div>
          <Button onClick={() => setStep("verify")} variant="primary" className="w-full">
            Continue to Verification
          </Button>
        </div>
      )}

      {showSetup && step === "verify" && (
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-6">
          <h4 className="mb-4 font-semibold text-purple-100">
            Step 2: Verify Code
          </h4>
          <p className="mb-4 text-sm text-purple-100/80">
            Enter the 6-digit code from your authenticator app:
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              placeholder="000000"
              className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-center text-2xl tracking-widest text-white"
              required
            />
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setStep("qr")}
                variant="secondary"
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {showSetup && step === "backup" && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-6">
          <h4 className="mb-4 font-semibold text-emerald-100">
            Step 3: Save Backup Codes
          </h4>
          <p className="mb-4 text-sm text-emerald-100/80">
            Save these backup codes in a safe place. You can use them to access your account
            if you lose your authenticator device.
          </p>
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-black/20 p-4">
            {backupCodes.map((code, i) => (
              <code key={i} className="text-sm text-emerald-100">
                {code}
              </code>
            ))}
          </div>
          <Button onClick={handleFinishSetup} variant="primary" className="w-full">
            I&apos;ve Saved My Backup Codes
          </Button>
        </div>
      )}

      {/* Disable Flow */}
      {showDisable && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
          <h4 className="mb-4 font-semibold text-red-100">Disable 2FA</h4>
          <p className="mb-4 text-sm text-red-100/80">
            Enter your password to confirm disabling two-factor authentication:
          </p>
          <form onSubmit={handleDisable} className="space-y-4">
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Your password"
              className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white"
              required
            />
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowDisable(false);
                  setDisablePassword("");
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? "Disabling..." : "Disable 2FA"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
