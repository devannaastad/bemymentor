// components/auth/SessionProvider.tsx
"use client";

import type { ReactNode } from "react";
import {
  SessionProvider as NextAuthProvider,
  useSession as useNextSession,
  signIn,
  signOut,
} from "next-auth/react";

/**
 * Single source of truth for session context.
 * - Wraps NextAuth's SessionProvider
 * - Re-exports useSession/signIn/signOut for existing imports
 */
export default function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}

// Re-export so components importing from "components/auth/SessionProvider"
// keep working without changes.
export const useSession = useNextSession;
export { signIn, signOut };
