// app/mentor-setup/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import MentorSetupForm from "@/components/mentor-setup/MentorSetupForm";

export const metadata = {
  title: "Complete Your Mentor Profile • BeMyMentor",
};

export default async function MentorSetupPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/login?callbackUrl=/mentor-setup");
  }

  // Check if user has an approved application
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      mentorProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // If they already have a mentor profile, redirect to dashboard
  if (user.mentorProfile) {
    redirect("/dashboard?already_setup=true");
  }

  // Check for approved application
  const approvedApp = await db.application.findFirst({
    where: {
      email,
      status: "APPROVED",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!approvedApp) {
    return (
      <section className="section">
        <div className="container max-w-2xl">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="text-center">
              <div className="mb-4 text-6xl">⏳</div>
              <h1 className="h2 mb-2">No Approved Application</h1>
              <p className="text-white/70">
                You need an approved mentor application before you can set up your profile.
              </p>
              <div className="mt-6">
                <a
                  href="/apply"
                  className="inline-block rounded-lg bg-white/10 px-6 py-3 text-sm font-medium hover:bg-white/20"
                >
                  Apply to Become a Mentor
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <h1 className="h1">Complete Your Mentor Profile</h1>
          <p className="muted mt-2">
            Congratulations! Your application for <strong>{approvedApp.topic}</strong> has been
            approved. Complete your profile to start accepting learners.
          </p>
        </div>

        <Card>
          <CardContent>
            <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <h3 className="mb-2 font-semibold text-blue-200">Application Details</h3>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-white/60">Topic:</dt>
                  <dd className="font-medium">{approvedApp.topic}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/60">Offer Type:</dt>
                  <dd className="font-medium">{approvedApp.offerType}</dd>
                </div>
                {approvedApp.accessPrice != null && (
                  <div className="flex justify-between">
                    <dt className="text-white/60">ACCESS Price:</dt>
                    <dd className="font-medium">${approvedApp.accessPrice}</dd>
                  </div>
                )}
                {approvedApp.hourlyRate != null && (
                  <div className="flex justify-between">
                    <dt className="text-white/60">Hourly Rate:</dt>
                    <dd className="font-medium">${approvedApp.hourlyRate}/hr</dd>
                  </div>
                )}
              </dl>
            </div>

            <MentorSetupForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
