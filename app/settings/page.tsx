// app/settings/page.tsx
//app/settings/page.tsx//
import Image from "next/image";
import { requireAuth } from "@/lib/requireAuth";

export default async function SettingsPage() {
  const session = await requireAuth({ callbackUrl: "/settings" });
  const user = session.user!;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Account settings</h1>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User avatar"}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-white/10" />
          )}
          <div>
            <div className="text-lg font-semibold">
              {user.name ?? "Unnamed user"}
            </div>
            <div className="text-white/60">{user.email}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 p-4">
            <div className="mb-1 text-sm font-medium">Authentication</div>
            <div className="text-sm text-white/60">
              You’re signed in. {/* Removed session.provider (not part of type) */}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 p-4">
            <div className="mb-1 text-sm font-medium">Security</div>
            <div className="text-sm text-white/60">
              Passwordless login enabled (Google &amp; Magic Link).
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-white/60">
          More profile controls coming soon (edit name, avatar, notifications,
          payout details…).
        </div>
      </section>
    </main>
  );
}
