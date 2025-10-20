// app/settings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import AvatarUploader from "@/components/settings/AvatarUploader";
import ProfileForm from "@/components/settings/ProfileForm";
import NotificationPreferences from "@/components/settings/NotificationPreferences";
import DangerZone from "@/components/settings/DangerZone";

export const metadata = {
  title: "Settings • BeMyMentor",
};

export default async function SettingsPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/signin?callbackUrl=/settings");
  }

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="h1">Settings</h1>
          <p className="muted mt-2">Manage your account settings and preferences.</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Photo */}
          <Card>
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Profile Photo</h2>
              <AvatarUploader initialUrl={user.image} />
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Notification Preferences</h2>
              <NotificationPreferences />
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <DangerZone />
        </div>
      </div>
    </section>
  );
}