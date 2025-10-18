//app/mentors/[id]/page.tsx//
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import type { Mentor } from "@prisma/client";
import SaveButton from "@/components/mentors/SaveButton";
import { Card, CardContent } from "@/components/common/Card";

function formatDollars(n?: number | null) {
  if (n == null) return null;
  return `$${n.toLocaleString()}`;
}

export default async function MentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const mentor = await db.mentor.findUnique({
    where: { id },
  });

  if (!mentor) return notFound();

  const {
    name,
    tagline,
    category,
    rating,
    reviews,
    offerType,
    accessPrice,
    hourlyRate,
    badges,
  } = mentor as Mentor & { badges: any };

  const access = formatDollars(accessPrice);
  const hourly = formatDollars(hourlyRate);
  const highlights: string[] = badges?.highlights ?? [];

  return (
    <section className="section">
      <div className="container">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="h1">{name}</h1>
            <p className="text-white/70">{tagline}</p>
            <div className="mt-2 text-sm text-white/50">
              <span className="uppercase tracking-wide">{category}</span>
              <span className="mx-2">•</span>
              <span>
                {rating.toFixed(1)} ⭐ ({reviews} reviews)
              </span>
            </div>
          </div>

          <SaveButton mentorId={id} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent>
              <h2 className="mb-3 text-xl font-semibold">What you’ll get</h2>
              {highlights.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 text-white/80">
                  {highlights.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/60">This mentor hasn’t added details yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-3 text-xl font-semibold">Pricing</h2>
              <div className="space-y-2 text-white/80">
                <div className="flex items-center justify-between">
                  <span>Offer type</span>
                  <span className="font-medium">{offerType}</span>
                </div>
                {access && (
                  <div className="flex items-center justify-between">
                    <span>Access price</span>
                    <span className="font-medium">{access}</span>
                  </div>
                )}
                {hourly && (
                  <div className="flex items-center justify-between">
                    <span>Hourly rate</span>
                    <span className="font-medium">{hourly}/hr</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Link href={`/book/${id}`} className="btn btn-primary w-full text-center">
                  Book this mentor
                </Link>
              </div>

              <div className="mt-3 text-center">
                <Link href="/catalog" className="text-sm text-white/60 underline underline-offset-4">
                  ← Back to catalog
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
