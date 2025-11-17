// app/mentor-dashboard/subscriptions/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SubscriptionPagesEditor from "@/components/mentor-dashboard/SubscriptionPagesEditor";

export const metadata = {
  title: "Edit Subscription Pages • BeMyMentor",
};

export default async function SubscriptionPagesEditorPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/signin?callbackUrl=/mentor-dashboard/subscriptions");
  }

  const user = await db.user.findUnique({
    where: { email },
    include: {
      mentorProfile: {
        include: {
          subscriptionPlans: {
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!user || !user.mentorProfile) {
    redirect("/mentor-setup");
  }

  const mentor = user.mentorProfile;
  const plans = mentor.subscriptionPlans;

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <SubscriptionPagesEditor mentorId={mentor.id} plans={plans} />
      </div>
    </section>
  );
}
