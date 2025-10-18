// lib/requireAuth.ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Server-side auth guard for App Router pages.
 * Usage:
 *   const session = await requireAuth({ callbackUrl: "/settings" });
 */
export async function requireAuth(opts?: { callbackUrl?: string }) {
  const session = await auth();
  if (!session?.user) {
    const cb = opts?.callbackUrl ?? "/";
    redirect(`/signin?callbackUrl=${encodeURIComponent(cb)}`);
  }
  return session;
}
