// components/layout/NavDropdown.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "@/components/auth/SessionProvider";

export default function NavDropdown() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <div className="relative">
      {status === "authenticated" && user ? (
        <div className="flex items-center gap-3">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="size-7 rounded-full bg-white/10" />
          )}
          <div className="text-sm">
            <div className="font-medium">{user.name ?? "Account"}</div>
            <div className="text-white/60">{user.email}</div>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <Link
              href="/settings"
              className="rounded-md px-3 py-1.5 text-sm ring-1 ring-white/15 hover:bg-white/10"
            >
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-md px-3 py-1.5 text-sm ring-1 ring-white/15 hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : status === "loading" ? (
        <div className="text-sm text-white/60">Loading…</div>
      ) : (
        // OPTION A: Link to /signin
        <Link
          href="/signin"
          className="rounded-md px-3 py-1.5 text-sm ring-1 ring-white/15 hover:bg-white/10"
        >
          Sign in
        </Link>

        // OPTION B (alternate): use the configured sign-in page
        // <button
        //   onClick={() => signIn()} // no provider -> routes to pages.signIn (/signin)
        //   className="rounded-md px-3 py-1.5 text-sm ring-1 ring-white/15 hover:bg-white/10"
        // >
        //   Sign in
        // </button>
      )}
    </div>
  );
}
