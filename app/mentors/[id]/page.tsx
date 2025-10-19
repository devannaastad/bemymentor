// app/mentors/[id]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import SaveButton from "@/components/mentors/SaveButton";
import { formatCurrency, ratingLabel } from "@/lib/utils/format";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const mentor = await db.mentor.findUnique({ 
    where: { id }, 
    select: { name: true, tagline: true } 
  });
  
  return {
    title: mentor?.name ? `${mentor.name} • BeMyMentor` : "Mentor • BeMyMentor",
    description: mentor?.tagline || "Find your perfect mentor on BeMyMentor",
  };
}

export default async function MentorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const mentor = await db.mentor.findUnique({
    where: { id },
  });

  if (!mentor) notFound();

  const badges = Array.isArray(mentor.badges) ? (mentor.badges as string[]) : [];

  return (
    <section className="section">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="h1 mb-2">{mentor.name}</h1>
              <p className="text-lg text-white/70">{mentor.tagline}</p>
            </div>
            <SaveButton mentorId={mentor.id} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-white/80">
              {ratingLabel(mentor.rating, mentor.reviews)}
            </div>
            {badges.map((badge) => (
              <Badge key={badge} variant="success">
                {badge}
              </Badge>
            ))}
            <Badge variant="outline">{mentor.category}</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {mentor.offerType !== "TIME" && mentor.accessPrice != null && (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">ACCESS Pass</h3>
                  <Badge variant="success">Popular</Badge>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {formatCurrency(mentor.accessPrice)}
                  </span>
                  <span className="text-white/60">/month</span>
                </div>
                <ul className="mb-4 space-y-2 text-sm text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Access to all digital resources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Private Discord/Telegram community</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Weekly group Q&A sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Exclusive templates & guides</span>
                  </li>
                </ul>
                <Button className="w-full" variant="primary">
                  Get ACCESS Pass
                </Button>
              </CardContent>
            </Card>
          )}

          {mentor.offerType !== "ACCESS" && mentor.hourlyRate != null && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">1-on-1 Sessions</h3>
                  {mentor.offerType === "TIME" && (
                    <Badge variant="outline">Available</Badge>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {formatCurrency(mentor.hourlyRate)}
                  </span>
                  <span className="text-white/60">/hour</span>
                </div>
                <ul className="mb-4 space-y-2 text-sm text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Personalized 1-on-1 coaching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Screen sharing & live feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Custom action plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Follow-up support via chat</span>
                  </li>
                </ul>
                <Button className="w-full">Book a Session</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* About Section */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="mb-4 text-xl font-semibold">About {mentor.name}</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70">
                {mentor.name} is an experienced {mentor.category} mentor specializing in{" "}
                {mentor.tagline.toLowerCase()}. With a {mentor.rating.toFixed(1)} rating and{" "}
                {mentor.reviews} reviews, they&apos;ve helped countless students achieve their goals.
              </p>
              <p className="mt-4 text-white/70">
                Whether you&apos;re just starting out or looking to level up your skills,{" "}
                {mentor.name} provides tailored guidance to help you succeed.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Learn */}
        {badges.length > 0 && (
          <Card className="mb-8">
            <CardContent>
              <h2 className="mb-4 text-xl font-semibold">What You&apos;ll Learn</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {badges.map((badge) => (
                  <div key={badge} className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      ✓
                    </div>
                    <span className="text-white/80">{badge}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section (Placeholder) */}
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reviews</h2>
              <div className="text-sm text-white/60">
                {mentor.reviews} {mentor.reviews === 1 ? "review" : "reviews"}
              </div>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="text-4xl font-bold">{mentor.rating.toFixed(1)}</div>
              <div>
                <div className="flex gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(mentor.rating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-white/60">
                  Based on {mentor.reviews} reviews
                </div>
              </div>
            </div>

            {/* Placeholder for actual reviews */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-white/60">
                Reviews will be displayed here once students start leaving feedback.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Catalog */}
        <div className="mt-8 text-center">
          <Button href="/catalog" variant="ghost">
            ← Back to Catalog
          </Button>
        </div>
      </div>
    </section>
  );
}