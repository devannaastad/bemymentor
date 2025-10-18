// app/login/page.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-3xl font-bold">Sign in</h1>

      {status === "loading" && (
        <p className="text-sm text-neutral-400">Checking session…</p>
      )}

      {status !== "loading" && !session && (
        <div className="space-y-4">
          <button
            onClick={() => signIn("google")}
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black ring-1 ring-white/20 hover:bg-white/90"
          >
            Continue with Google
          </button>

          <p className="text-xs text-neutral-400">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      )}

      {session && (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-sm text-neutral-300">
              Signed in as{" "}
              <span className="font-medium text-white">
                {session.user?.email ?? session.user?.name}
              </span>
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full rounded-lg bg-transparent px-4 py-3 font-medium text-white ring-1 ring-white/20 hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      )}
    </main>
  );
}
