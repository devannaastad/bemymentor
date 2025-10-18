// app/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import AvatarUploader from "@/components/settings/AvatarUploader";
import { Prose, SectionHeader } from "@/components/common";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeader title="Settings" subtitle="Manage your account and preferences" />
      <div className="mt-8 grid gap-8">
        {/* Profile Photo */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Profile Photo</h2>
          <AvatarUploader initialUrl={session?.user?.image ?? null} />
        </section>

        {/* Placeholder for other settings sections */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Account</h2>
          <Prose>
            <p>Update your name, email, and other profile details here (coming soon).</p>
          </Prose>
        </section>
      </div>
    </main>
  );
}
