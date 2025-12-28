"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/common/Button";

export default function AdminHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/applications", label: "Applications" },
    { href: "/admin/mentors", label: "Mentors" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/bookings", label: "Bookings" },
    { href: "/admin/disputes", label: "Disputes" },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="border-b border-white/10 bg-white/5">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold">
            Admin Panel
          </Link>
          <nav className="flex gap-2 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md transition ${
                  isActive(link.href, link.exact)
                    ? "bg-primary-500 text-white font-medium"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Button href="/" variant="ghost" size="sm">
          View Site
        </Button>
      </div>
    </div>
  );
}
