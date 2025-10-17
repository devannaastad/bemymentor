// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import NavDropdown from "./NavDropdown";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold text-white">
          BeMyMentor
        </Link>

        <nav className="hidden gap-4 md:flex">
          <NavLink href="/catalog" label="Catalog" />
          <NavLink href="/apply" label="Apply" />
          <NavLink href="/saved" label="Saved" />
        </nav>

        <div className="md:hidden" aria-label="Menu">
          <NavDropdown />
        </div>

        <div className="hidden md:block">
          <NavDropdown />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
    >
      {label}
    </Link>
  );
}
