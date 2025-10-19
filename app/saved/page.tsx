// app/saved/page.tsx
import { Suspense } from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import MentorCard from "@/components/catalog/MentorCard";
import MentorCardShimmer from "@/components/catalog/MentorCardShimmer";
import type { Mentor } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getSavedMentors(): Promise<Mentor[]> {
  try {
    const session = await auth();
    const email = session?.user?.email;
    
    if (!email) {
      redirect("/signin?callbackUrl=/saved");
    }

    // Get saved mentor IDs
    const saved = await db.savedMentor.findMany({
      where: { user: { email } },
      select: { mentorId: true },
    });

    if (saved.length === 0) {
      return [];
    }

    const ids = saved.map((s) => s.mentorId);

    // Fetch the actual mentors
    const mentors = await db.mentor.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: "desc" },
    });

    return mentors;
  } catch (err) {
    console.error("[saved/page] Error:", err);
    return [];
  }
}

async function SavedResults() {
  const mentors = await getSavedMentors();
  
  if (mentors.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-lg text-white/60 mb-4">No saved mentors yet.</p>
        <p className="text-sm text-white/40">
          Browse the catalog and save mentors you&apos;re interested in!
        </p>
      </div>
    );
  }
  
  return (
    <>
      {mentors.map((m) => (
        <MentorCard key={m.id} m={m} />
      ))}
    </>
  );
}

function SavedFallback() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <MentorCardShimmer key={i} />
      ))}
    </>
  );
}

export default async function SavedPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="h1 mb-6">Saved mentors</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<SavedFallback />}>
            <SavedResults />
          </Suspense>
        </div>
      </div>
    </section>
  );
}