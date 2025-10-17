// app/saved/page.tsx
import { headers } from "next/headers";
import MentorCard from "@/components/catalog/MentorCard";
import { Card, CardContent } from "@/components/common/Card";
import SavedLoader from "@/components/catalog/SavedLoader";
import type { Mentor } from "@prisma/client";

type SP = { ids?: string };

export default async function SavedPage({
  searchParams,
}: {
  // Next 15: dynamic APIs are Promises
  searchParams?: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};
  const idsParam = (sp.ids ?? "").trim();

  // Build absolute URL from request headers
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  let mentors: Mentor[] = [];

  if (idsParam) {
    const res = await fetch(`${baseUrl}/api/mentors?ids=${encodeURIComponent(idsParam)}`, {
      // cached a bit; update to taste
      next: { revalidate: 60 },
    });
    const json = (await res.json()) as { ok: boolean; data: Mentor[] };
    mentors = json?.data ?? [];
  }

  const hasIds = Boolean(idsParam);

  return (
    <section className="section">
      {/* Client loader will redirect to ?ids=... if you came here without query */}
      <SavedLoader />

      <div className="container">
        <h1 className="h1 mb-6">Saved mentors</h1>

        {!hasIds && (
          <Card>
            <CardContent>
              <p className="muted">
                You haven’t saved any mentors yet. Browse the{" "}
                <a href="/catalog" className="underline underline-offset-4">
                  catalog
                </a>{" "}
                and tap “Save” on mentors you like.
              </p>
            </CardContent>
          </Card>
        )}

        {hasIds && mentors.length === 0 && (
          <Card>
            <CardContent>
              <p className="muted">No saved mentors found. They might have been removed.</p>
            </CardContent>
          </Card>
        )}

        {mentors.length > 0 && (
          <div className="grid gap-4">
            {mentors.map((m) => (
              <MentorCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
