//app/book/[id]/page.tsx//
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Button from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { formatCurrency } from "@/lib/utils/format";
import { db } from "@/lib/db";

export default async function BookMentorPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: Promise<Record<string, string>>;
}) {
  const sp = (await searchParams) ?? {};
  const mentor = await db.mentor.findUnique({ where: { id: params.id } });
  if (!mentor) notFound();

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const base = `${proto}://${host}`;

  return (
    <section className="section">
      <div className="container grid gap-6">
        <h1 className="h1">Book {mentor.name}</h1>
        <Card>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <p className="muted">{mentor.tagline}</p>
              <div className="text-sm text-white/80">
                {mentor.offerType !== "ACCESS" && mentor.hourlyRate != null && (
                  <div>Hourly: {formatCurrency(mentor.hourlyRate)}</div>
                )}
                {mentor.offerType !== "TIME" && mentor.accessPrice != null && (
                  <div>Access/Package: {formatCurrency(mentor.accessPrice)}</div>
                )}
              </div>
              <p className="text-xs text-white/50">
                This is a lightweight scheduler. We’ll upgrade it to a full calendar (Calendly/Google
                Calendar) integration next.
              </p>
            </div>

            {/* Simple date/time picker placeholder */}
            <form
              action={`${base}/api/placeholder-book`}
              method="post"
              className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <input type="hidden" name="mentorId" value={mentor.id} />
              <label className="text-sm text-white/70">Choose a date</label>
              <input
                required
                className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:border-white/30"
                type="date"
                name="date"
              />
              <label className="text-sm text-white/70">Choose a start time</label>
              <input
                required
                className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:border-white/30"
                type="time"
                name="time"
              />
              <label className="text-sm text-white/70">Notes (optional)</label>
              <textarea
                className="min-h-24 rounded-xl border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:border-white/30"
                name="note"
                placeholder="What would you like to cover?"
              />
              <div className="mt-2 flex gap-2">
                <Button type="submit">Request booking</Button>
                <Button variant="ghost" href={`/mentors/${mentor.id}`}>
                  Back to profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
