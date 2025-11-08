// app/admin/layout.tsx
import { requireAdmin } from "@/lib/admin";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <AdminHeader />
      {/* Admin Content */}
      {children}
    </div>
  );
}