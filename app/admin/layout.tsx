// app/admin/layout.tsx
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import Button from "@/components/common/Button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/applications" className="font-semibold">
              Admin Panel
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin/applications" className="text-white/70 hover:text-white">
                Applications
              </Link>
              <Link href="/catalog" className="text-white/70 hover:text-white">
                View Site
              </Link>
            </nav>
          </div>
          <Button href="/" variant="ghost" size="sm">
            Back to Site
          </Button>
        </div>
      </div>

      {/* Admin Content */}
      {children}
    </div>
  );
}