// app/mentor-dashboard/access-pass/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import AccessPassEditor from "@/components/mentor-dashboard/AccessPassEditor";

export const metadata = {
  title: "Edit Access Pass Page • BeMyMentor",
};

export default async function AccessPassEditorPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/signin?callbackUrl=/mentor-dashboard/access-pass");
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { mentorProfile: true },
  });

  if (!user || !user.mentorProfile) {
    redirect("/mentor-setup");
  }

  const mentor = user.mentorProfile;

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <AccessPassEditor mentor={mentor} />
      </div>
    </section>
  );
}
