// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/common";
import NavDropdown, { NavItem } from "./NavDropdown";
import Modal from "@/components/common/Modal";
import PrefetchLink from "./PrefetchLink";

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
    { label: "Catalog", href: "/catalog" },
    { label: "Apply as Mentor", href: "/apply" },
    { label: "Saved", href: "/saved" },
    { label: "Settings", href: "/settings" },
    { label: "Sign out", onSelect: () => setShowSignOutConfirm(true) },
  ];

  const avatar = session?.user?.image ?? null;

  return (
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
          <TopLink href="/saved" active={pathname === "/saved"}>
            Saved
          </TopLink>
          <TopLink href="/settings" active={pathname === "/settings"}>
            Settings
          </TopLink>
        </div>

        {/* Right: Account */}
        <div className="flex items-center gap-2">
          {status === "loading" && (
            <div className="h-8 w-28 animate-pulse rounded-md bg-white/10" />
          )}

          {status !== "authenticated" ? (
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-md border border-white/15 px-3 text-sm text-neutral-200 hover:bg-white/5"
            >
              Sign in
            </Link>
          ) : (
            <NavDropdown
              trigger={
                <Button
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-3 py-1.5 text-sm text-neutral-100 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  aria-label="Account menu"
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white/10">
                    {avatar ? (
                      <Image src={avatar} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-300">
                        {username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="max-w-[10rem] truncate">{username}</span>
                  <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              }
              items={items}
              signedInAs={session?.user?.email ?? username}
            />
          )}
        </div>
      </nav>

      {/* Confirm Sign Out */}
      <Modal open={showSignOutConfirm} onClose={() => setShowSignOutConfirm(false)}>
        <h3 className="text-base font-semibold text-white">Sign out?</h3>
        <p className="mt-1 text-sm text-neutral-300">You can always sign back in later.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => setShowSignOutConfirm(false)} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowSignOutConfirm(false);
              void signOut({ callbackUrl: "/" });
            }}
            variant="danger"
          >
            Sign out
          </Button>
        </div>
      </Modal>
    </header>
  );
}

function TopLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
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
