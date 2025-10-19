// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/common";
import NavDropdown, { NavItem } from "./NavDropdown";
import PrefetchLink from "./PrefetchLink";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const username =
    (session?.user?.name && session.user.name.trim()) ||
    session?.user?.email?.split("@")[0] ||
    "Account";

  const items: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Catalog", href: "/catalog" },
    { label: "Apply as Mentor", href: "/apply" },
    { label: "Saved", href: "/saved" },
    { label: "Settings", href: "/settings" },
    { label: "Sign out", onSelect: () => setShowSignOutConfirm(true) },
  ];

  const avatar = session?.user?.image ?? null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-neutral-950/70 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold">
              BM
            </span>
            <span className="hidden text-sm font-semibold sm:inline">BeMyMentor</span>
          </Link>

          {/* Center: Primary nav */}
          <div className="hidden items-center gap-6 text-sm md:flex">
            <TopLink href="/catalog" active={pathname === "/catalog"}>
              Catalog
            </TopLink>
            <TopLink href="/apply" active={pathname === "/apply"}>
              Apply
            </TopLink>
            {status === "authenticated" && (
              <>
                <TopLink href="/dashboard" active={pathname === "/dashboard"}>
                  Dashboard
                </TopLink>
                <TopLink href="/saved" active={pathname === "/saved"}>
                  Saved
                </TopLink>
              </>
            )}
          </div>

          {/* Right: Account */}
          <div className="flex items-center gap-2">
            {status === "loading" && (
              <div className="h-8 w-28 animate-pulse rounded-md bg-white/10" />
            )}

            {status !== "authenticated" && status !== "loading" && (
              <>
                <Button href="/signin" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button href="/apply" size="sm">
                  Apply
                </Button>
              </>
            )}

            {status === "authenticated" && (
              <NavDropdown
                trigger={
                  <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-white/10">
                    {avatar && (
                      <Image
                        src={avatar}
                        alt={username}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <span>{username}</span>
                  </button>
                }
                items={items}
                signedInAs={session?.user?.email || undefined}
              />
            )}
          </div>
        </nav>
      </header>

      {/* Sign out confirmation modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900 p-6">
            <h2 className="mb-2 text-lg font-semibold">Sign out?</h2>
            <p className="mb-6 text-sm text-white/70">
              Are you sure you want to sign out?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowSignOutConfirm(false)}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setShowSignOutConfirm(false);
                }}
                variant="danger"
                size="sm"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TopLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <PrefetchLink
      href={href}
      className={`relative text-sm transition ${
        active ? "text-white" : "text-neutral-300 hover:text-neutral-100"
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-2 left-0 right-0 mx-auto h-0.5 w-6 rounded-full bg-white/60" />
      )}
    </PrefetchLink>
  );
}