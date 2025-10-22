"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

interface EmailSignInFormProps {
  callbackUrl?: string;
}

export default function EmailSignInForm({ callbackUrl }: EmailSignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // If 2FA is needed, verify the token first
      if (needs2FA) {
        const res = await fetch("/api/auth/2fa-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, token: twoFactorToken }),
        });

        const data = await res.json();

        if (!data.ok || !data.valid) {
          setError(data.error || "Invalid 2FA code");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if user has 2FA enabled
        const checkRes = await fetch("/api/auth/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const checkData = await checkRes.json();

        if (checkData.hasOAuthOnly) {
          setError("This account uses Google sign-in. Please use the 'Continue with Google' button below.");
        } else if (checkData.has2FA && !needs2FA) {
          // User has 2FA enabled, show 2FA input
          setNeeds2FA(true);
          setError("");
        } else {
          setError("Invalid email or password");
        }
      } else {
        router.push(callbackUrl || "/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {!needs2FA ? (
        <>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/90">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/90">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="••••••••"
            />
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="2fa-token" className="mb-2 block text-sm font-medium text-white/90">
            Two-Factor Authentication Code
          </label>
          <input
            id="2fa-token"
            type="text"
            value={twoFactorToken}
            onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            required
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-center text-2xl tracking-widest text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="000000"
          />
          <p className="mt-2 text-xs text-white/60">
            Enter the 6-digit code from your authenticator app or use a backup code.
          </p>
          <button
            type="button"
            onClick={() => {
              setNeeds2FA(false);
              setTwoFactorToken("");
              setError("");
            }}
            className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
          >
            Back to login
          </button>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full justify-center"
        disabled={loading}
      >
        {loading ? "Signing in..." : needs2FA ? "Verify & Sign In" : "Sign in with Email"}
      </Button>
    </form>
  );
}
