// app/mentors/[id]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import SaveButton from "@/components/mentors/SaveButton";
import ReviewList from "@/components/reviews/ReviewList";
import PortfolioSection, { type PortfolioItem } from "@/components/mentor/PortfolioSection";
import VideoIntroSection from "@/components/mentor/VideoIntroSection";
import { formatCurrency } from "@/lib/utils/format";

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

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

// Cached mentor data fetch
const getMentorData = unstable_cache(
  async (mentorId: string) => {
    return db.mentor.findUnique({
      where: { id: mentorId, isActive: true },
      include: {
        subscriptionPlans: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
    });
  },
  ["mentor-data"],
  { revalidate: 300, tags: ["mentor"] }
);

// Cached reviews fetch
const getMentorReviews = unstable_cache(
  async (mentorId: string) => {
    return db.review.findMany({
      where: { mentorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        booking: {
          select: {
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["mentor-reviews"],
  { revalidate: 60, tags: ["reviews"] }
);

export default async function MentorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const session = await auth();

  const mentor = await getMentorData(id);

  if (!mentor) notFound();

  // Check if user already has an access pass for this mentor
  let hasAccessPass = false;
  if (session?.user?.id) {
    const existingAccessPass = await db.booking.findFirst({
      where: {
        userId: session.user.id,
        mentorId: id,
        type: "ACCESS",
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
    });
    hasAccessPass = !!existingAccessPass;
  }

  // Fetch reviews for this mentor (cached)
  const reviews = await getMentorReviews(id);

  const badges = Array.isArray(mentor.badges) ? (mentor.badges as string[]) : [];
  const skills = Array.isArray(mentor.skills) ? (mentor.skills as string[]) : [];
  const portfolio = (mentor.portfolio && Array.isArray(mentor.portfolio)
    ? mentor.portfolio
    : []) as unknown as PortfolioItem[];

  return (
    <section className="section">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start gap-6">
            {/* Profile Image */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white/10 md:h-32 md:w-32">
              {mentor.profileImage ? (
                <Image
                  src={mentor.profileImage}
                  alt={mentor.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 96px, 128px"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-4xl font-bold text-white md:text-5xl">
                  {mentor.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Mentor Info */}
            <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="h1 mb-2">{mentor.name}</h1>
                <p className="text-lg text-white/70">{mentor.tagline}</p>
              </div>
              <SaveButton mentorId={mentor.id} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-amber-400">★</span>
              <span className="font-medium">{mentor.rating.toFixed(1)}</span>
              <span className="text-white/60">({mentor.reviews} reviews)</span>
            </div>
            {badges.map((badge) => (
              <Badge key={badge} variant="success">
                {badge}
              </Badge>
            ))}
            <Badge variant="outline">{mentor.category}</Badge>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-white/80 mb-2">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-white/90 hover:bg-white/15 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* About Section */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="mb-4 text-xl font-semibold">About {mentor.name}</h2>
            <div className="prose prose-invert max-w-none">
              {mentor.bio ? (
                <p className="text-white/70 whitespace-pre-wrap">{mentor.bio}</p>
              ) : (
                <>
                  <p className="text-white/70">
                    {mentor.name} is an experienced {mentor.category} mentor specializing in{" "}
                    {mentor.tagline.toLowerCase()}. With a {mentor.rating.toFixed(1)} rating and{" "}
                    {mentor.reviews} reviews, they&apos;ve helped countless students achieve their goals.
                  </p>
                  <p className="mt-4 text-white/70">
                    Whether you&apos;re just starting out or looking to level up your skills,{" "}
                    {mentor.name} provides tailored guidance to help you succeed.
                  </p>
                </>
              )}
            </div>

            {/* Social Links */}
            {mentor.socialLinks && typeof mentor.socialLinks === "object" && (
              <div className="mt-6 flex flex-wrap gap-3">
                {Object.entries(mentor.socialLinks as Record<string, string>).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                ))}
              </div>
            )}
            </CardContent>
            </Card>

            {/* Video Introduction Section */}
            {mentor.videoIntro && <VideoIntroSection videoUrl={mentor.videoIntro} />}

            {/* Portfolio Section */}
            <PortfolioSection portfolio={portfolio} />

            {/* Subscription Plans */}
            {mentor.subscriptionPlans && mentor.subscriptionPlans.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Subscription Plans</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mentor.subscriptionPlans.map((plan) => {
                    const features = Array.isArray(plan.features) ? plan.features as string[] : [];
                    const intervalLabel =
                      plan.interval === "WEEKLY" ? "week" :
                      plan.interval === "MONTHLY" ? "month" : "year";

                    return (
                      <Card key={plan.id} className="border-purple-500/20 bg-purple-500/5">
                        <CardContent>
                          <div className="mb-3">
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            {plan.description && (
                              <p className="mt-1 text-sm text-white/60">{plan.description}</p>
                            )}
                          </div>
                          <div className="mb-4">
                            <span className="text-3xl font-bold">
                              {formatCurrency(plan.price)}
                            </span>
                            <span className="text-white/60">/{intervalLabel}</span>
                          </div>
                          <ul className="mb-4 space-y-2 text-sm text-white/80">
                            {features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-400">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button href={`/subscribe/${mentor.id}/${plan.id}`} className="w-full" variant="primary">
                            Subscribe
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pricing Cards */}
            <div className="mb-8 grid gap-4 md:grid-cols-2">
              {mentor.offerType !== "TIME" && mentor.accessPrice != null && (
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">ACCESS Pass</h3>
                      {mentor.offerType === "ACCESS" && (
                        <Badge variant="success">Available</Badge>
                      )}
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        {formatCurrency(mentor.accessPrice)}
                      </span>
                      <span className="text-white/60"> one-time</span>
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
                    {hasAccessPass ? (
                      <Button href={`/access-pass/${mentor.id}`} className="w-full" variant="primary">
                        Access Your Content
                      </Button>
                    ) : (
                      <Button href={`/book/${mentor.id}`} className="w-full" variant="primary">
                        Get ACCESS Pass
                      </Button>
                    )}
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
                    <Button href={`/book/${mentor.id}`} className="w-full">
                      Book a Session
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Reviews Section */}
            <Card>
              <CardContent>
                <h2 className="mb-4 text-xl font-semibold">
                  Reviews ({reviews.length})
                </h2>
                <ReviewList reviews={reviews} />
              </CardContent>
            </Card>
          </div>
        </section>
      );
    }
