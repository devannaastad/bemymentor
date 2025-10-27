// app/mentor-dashboard/profile/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import ProfileEditor from "@/components/mentor/ProfileEditor";

export default async function MentorProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Fetch mentor profile
  const mentor = await db.mentor.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!mentor) {
    // User doesn't have a mentor profile yet
    return (
      <div className="section">
        <div className="container max-w-4xl">
          <h1 className="mb-4 text-3xl font-bold">Create Your Mentor Profile</h1>
          <p className="mb-6 text-white/70">
            You don&apos;t have a mentor profile yet. Create one to start offering your services.
          </p>
          {/* TODO: Add create profile flow */}
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Edit Your Profile</h1>
          <p className="text-white/70">
            Update your mentor profile information, portfolio, availability, and more.
          </p>
        </div>

        <ProfileEditor mentor={mentor} />
      </div>
    </div>
  );
}
