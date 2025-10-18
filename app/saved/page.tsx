// app/saved/page.tsx
import { cache, Suspense } from "react";
import { headers } from "next/headers";
import MentorCard from "@/components/catalog/MentorCard";
import MentorCardShimmer from "@/components/catalog/MentorCardShimmer";
import type { Mentor } from "@prisma/client";

export const revalidate = 30;

const fetchSaved = cache(async (absoluteUrl: string) => {
  const res = await fetch(absoluteUrl, { next: { revalidate: 30 } });
  if (!res.ok) return [] as Mentor[];
  const json = (await res.json()) as { ok: boolean; data: Mentor[] };
  return json?.data ?? [];
});

async function SavedResults({ url }: { url: string }) {
  const mentors = await fetchSaved(url);
  if (mentors.length === 0) {
    return <p className="muted">No saved mentors yet.</p>;
  }
  return <>{mentors.map((m) => <MentorCard key={m.id} m={m} />)}</>;
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
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;
  const apiUrl = `${baseUrl}/api/saved`;

  return (
    <section className="section">
      <div className="container">
        <h1 className="h1 mb-6">Saved mentors</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<SavedFallback />}>
            <SavedResults url={apiUrl} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
