// app/logout/page.tsx
"use client";

import { useEffect } from "react";
import { signOut, useSession } from "@/components/auth/SessionProvider";

export default function LogoutPage() {
  const { status } = useSession();

  useEffect(() => {
    // Trigger a real sign out, then redirect home
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Signing you out…</h1>
      <p className="text-sm text-white/60">Current status: {status}</p>
    </main>
  );
}
