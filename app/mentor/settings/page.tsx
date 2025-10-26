// app/mentor/settings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import MentorSettingsForm from "@/components/mentor/MentorSettingsForm";

export const metadata = {
  title: "Mentor Settings - BeMyMentor",
  description: "Manage your mentor profile settings, pricing, and free sessions",
};

export default async function MentorSettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      mentorProfile: true,
    },
  });

  if (!user?.mentorProfile) {
    redirect("/apply");
  }

  const mentor = user.mentorProfile;

  return (
    <section className="section min-h-screen">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="h1 mb-4">Mentor Settings</h1>
          <p className="text-white/70 text-lg">
            Manage your pricing, free sessions, and profile settings
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <MentorSettingsForm mentor={mentor} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
