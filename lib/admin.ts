// lib/admin.ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * List of admin emails (in production, store this in database)
 */
const ADMIN_EMAILS = [
  "devannaastad@gmail.com",
  // Add more admin emails here
];

/**
 * Check if user is an admin
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Require admin authentication for server components/actions
 * Usage: const session = await requireAdmin();
 */
export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email;

  if (!isAdmin(email)) {
    redirect("/signin?callbackUrl=/admin/applications&error=unauthorized");
  }

  return session;
}