// app/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import AvatarUploader from "@/components/settings/AvatarUploader";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  const { data: session, status } = useSession();

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    redirect("/signin?callbackUrl=/settings");
  }

  if (status === "loading") {
    return (
      <section className="section">
        <div className="container max-w-2xl">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-48 rounded bg-white/10"></div>
            <div className="space-y-4">
              <div className="h-32 rounded-lg bg-white/5"></div>
              <div className="h-32 rounded-lg bg-white/5"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container max-w-2xl">
        <h1 className="h1 mb-6">Settings</h1>

        {/* Profile Photo */}
        <Card className="mb-6">
          <CardContent>
            <h2 className="mb-4 text-lg font-semibold">Profile Photo</h2>
            <AvatarUploader initialUrl={session?.user?.image ?? null} />
          </CardContent>
        </Card>

        {/* Profile Section */}
        <Card className="mb-6">
          <CardContent>
            <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/60">Name</label>
                <p className="text-white">{session?.user?.name || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm text-white/60">Email</label>
                <p className="text-white">{session?.user?.email}</p>
              </div>
            </div>
            <Button className="mt-4" variant="ghost" disabled>
              Edit Profile (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardContent>
            <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
            <p className="text-sm text-white/60">
              Email notifications are currently enabled for application updates and new messages from mentors.
            </p>
            <Button className="mt-4" variant="ghost" disabled>
              Manage Notifications (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="mb-6">
          <CardContent>
            <h2 className="mb-4 text-lg font-semibold">Privacy & Security</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Two-factor authentication</span>
                <Button variant="ghost" size="sm" disabled>
                  Enable (Coming Soon)
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Connected accounts</span>
                <Button variant="ghost" size="sm" disabled>
                  Manage (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardContent>
            <h2 className="mb-2 text-lg font-semibold text-rose-300">Danger Zone</h2>
            <p className="mb-4 text-sm text-white/60">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="danger" disabled>
              Delete Account (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button href="/dashboard" variant="ghost">
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </section>
  );
}