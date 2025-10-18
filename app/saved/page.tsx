// app/saved/page.tsx
import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import MentorCard from "@/components/catalog/MentorCard";
import { Card, CardContent } from "@/components/common/Card";
import SavedLoader from "@/components/catalog/SavedLoader";
import type { Mentor } from "@prisma/client";

type SP = { ids?: string };

export default async function SavedPage({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const session = await auth();

  let mentors: Mentor[] = [];

  if (session?.user?.email) {
    // Server-side: pull saved mentors from DB for signed-in users
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) {
      const rows = await db.savedMentor.findMany({
        where: { userId: user.id },
        include: { mentor: true },
        orderBy: { createdAt: "desc" },
      });
      mentors = rows.map((row: { mentor: Mentor }) => row.mentor);
    }
  } else {
    // Anonymous fallback: support ?ids=a,b,c (localStorage -> query via SavedLoader)
    const sp = (await searchParams) ?? {};
    const idsParam = (sp.ids ?? "").trim();
    if (idsParam) {
      const h = await headers();
      const proto = h.get("x-forwarded-proto") ?? "http";
      const host = h.get("host") ?? "localhost:3000";
      const baseUrl = `${proto}://${host}`;
      const res = await fetch(`${baseUrl}/api/mentors?ids=${encodeURIComponent(idsParam)}`, {
        next: { revalidate: 60 },
      });
      const json = (await res.json()) as { ok: boolean; data: Mentor[] };
      mentors = json?.data ?? [];
    }
  }

  const hasAny = mentors.length > 0;

  return (
    <section className="section">
      <SavedLoader />
      <div className="container">
        <h1 className="h1 mb-6">Saved mentors</h1>

        {!hasAny && (
          <Card>
            <CardContent>
              <p className="muted">
                {session?.user ? (
                  "You haven't saved any mentors yet."
                ) : (
                  <>
                    You haven’t saved any mentors yet. Browse the{" "}
                    <a href="/catalog" className="underline underline-offset-4">
                      catalog
                    </a>{" "}
                    and tap “Save” on mentors you like.
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {hasAny && (
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
