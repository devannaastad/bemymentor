// components/layout/NavDropdown.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/components/common/cn";
import { useSession } from "@/components/auth/SessionProvider";

export default function NavDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { user } = useSession();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90",
          "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
        )}
      >
        Menu
        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden className="opacity-70">
          <path fill="currentColor" d="M5.5 7.5L10 12l4.5-4.5z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur"
        >
          {user && (
            <div className="mb-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/80">
              Signed in as <span className="font-medium text-white">{user.name}</span>
              <div className="truncate text-white/60">{user.email}</div>
            </div>
          )}

          <MenuLink href="/" label="Home" />
          <MenuLink href="/catalog" label="Browse Catalog" />
          <MenuLink href="/saved" label="Saved Mentors" />
          <MenuLink href="/apply" label="Become a Mentor" />

          <Divider />

          <MenuGroup label="Legal">
            <MenuLink href="/legal/tos" label="Terms of Service" />
            <MenuLink href="/legal/privacy" label="Privacy Policy" />
            <MenuLink href="/legal/refunds" label="Refunds" />
          </MenuGroup>

          <Divider />

          <MenuLink href="/settings" label="Settings" />

          {!user ? (
            <MenuLink href="/login" label="Sign in" />
          ) : (
            <MenuLink href="/logout" label="Sign out" />
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className={cn(
        "block rounded-lg px-3 py-2 text-sm text-white/90",
        "hover:bg-white/10 focus:bg-white/10 focus:outline-none"
      )}
    >
      {label}
    </Link>
  );
}

function MenuGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="grid gap-1">
      <div className="px-3 pb-1 pt-2 text-xs uppercase tracking-wide text-white/50">{label}</div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-2 h-px bg-white/10" aria-hidden />;
}
