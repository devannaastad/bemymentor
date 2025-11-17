// app/subscription/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/format";
import { ExternalLink, CreditCard, AlertCircle, ChevronDown, Video } from "lucide-react";
import Badge from "@/components/common/Badge";
import SubscriptionImages from "@/components/subscription/SubscriptionImages";
import SubscriptionTabs from "@/components/subscription/SubscriptionTabs";

type Params = {
  id: string; // subscription ID
};

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const session = await auth();

  // Require authentication
  if (!session?.user?.email) {
    redirect(`/signin?callbackUrl=/subscription/${id}`);
  }

  // Get user
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      mentorProfile: { select: { id: true } },
    },
  });

  if (!user) {
    redirect("/signin");
  }

  // Fetch subscription with plan and mentor details
  const subscription = await db.userSubscription.findUnique({
    where: { id },
    include: {
      plan: true,
      mentor: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          tagline: true,
          category: true,
        },
      },
    },
  });

  if (!subscription) {
    notFound();
  }

  // Verify subscription belongs to user OR user is the mentor
  const isSubscriber = subscription.userId === user.id;
  const isMentor = user.mentorProfile?.id === subscription.mentorId;

  if (!isSubscriber && !isMentor) {
    notFound();
  }

  const plan = subscription.plan;
  const mentor = subscription.mentor;
  const accessLinks = Array.isArray(plan.accessLinks)
    ? (plan.accessLinks as Array<{ title: string; url: string }>)
    : [];
  const pageVideos = Array.isArray(plan.pageVideos)
    ? (plan.pageVideos as Array<{ title: string; url: string; description?: string }>)
    : [];
  const pageImages = Array.isArray(plan.pageImages)
    ? (plan.pageImages as Array<{ url: string; caption?: string }>)
    : [];

  const intervalLabel =
    plan.interval === "WEEKLY"
      ? "week"
      : plan.interval === "MONTHLY"
      ? "month"
      : "year";

  const statusColor =
    subscription.status === "ACTIVE"
      ? "success"
      : subscription.status === "CANCELLED"
      ? "warning"
      : "default";

  return (
    <section className="section">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button href="/dashboard" variant="ghost" size="sm" className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="h1 mb-2">Subscription Details</h1>
          <p className="text-white/60">Manage your subscription and access resources</p>
        </div>

        {/* Subscription Header */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center gap-4">
              {/* Mentor Image */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
                {mentor.profileImage ? (
                  <Image
                    src={mentor.profileImage}
                    alt={mentor.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                    {mentor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Plan Info */}
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  <Badge variant={statusColor}>{subscription.status}</Badge>
                </div>
                <p className="mb-1 text-white/70">with {mentor.name}</p>
                {mentor.tagline && (
                  <p className="text-sm text-white/50">{mentor.tagline}</p>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-3xl font-bold">{formatCurrency(plan.price)}</div>
                <div className="text-sm text-white/60">/{intervalLabel}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Content and Messages */}
        <SubscriptionTabs
          subscriptionId={id}
          contentSlot={
            <>
              {/* Welcome Message */}
              {plan.welcomeMessage && (
                <Card className="mb-6 border-purple-500/20 bg-purple-500/5">
                  <CardContent>
                    <h3 className="mb-3 font-semibold text-purple-200">
                      Message from {mentor.name}
                    </h3>
                    <p className="whitespace-pre-wrap text-white/70">
                      {plan.welcomeMessage}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Custom Page Content */}
              {plan.pageContent && (
                <Card className="mb-6">
                  <CardContent>
                    <h3 className="mb-4 text-xl font-semibold">About This Subscription</h3>
                    <div className="whitespace-pre-wrap text-white/70">
                      {plan.pageContent}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Videos */}
              {pageVideos.length > 0 && (
                <Card className="mb-6">
                  <CardContent>
                    <div className="mb-4 flex items-center gap-2">
                      <Video className="h-5 w-5 text-purple-400" />
                      <h3 className="text-xl font-semibold">Video Content</h3>
                    </div>
                    <div className="space-y-4">
                      {pageVideos.map((video, idx) => (
                        <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-4">
                          <h4 className="mb-2 font-semibold text-white">{video.title}</h4>
                          {video.description && (
                            <p className="mb-3 text-sm text-white/60">{video.description}</p>
                          )}
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="text-sm font-medium">Watch Video</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              <SubscriptionImages images={pageImages} />

              {/* Access Links */}
              {accessLinks.length > 0 && (
                <Card className="mb-6">
                  <CardContent>
                    <h3 className="mb-4 text-xl font-semibold">Your Resources</h3>
                    <div className="space-y-2">
                      {accessLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-purple-500/50 hover:bg-white/10"
                        >
                          <span className="font-medium text-white">{link.title}</span>
                          <ExternalLink className="h-5 w-5 text-white/60" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          }
        />

        {/* Billing Information - Collapsible */}
        <details className="group mb-6">
          <summary className="cursor-pointer list-none">
            <Card className="border-white/20 transition-colors group-open:border-purple-500/30">
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-white/60" />
                  <h3 className="font-semibold text-white/90">Billing Information</h3>
                </div>
                <ChevronDown className="h-5 w-5 text-white/60 transition-transform group-open:rotate-180" />
              </CardContent>
            </Card>
          </summary>
          <Card className="mt-2 border-white/10">
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Status</span>
                  <Badge variant={statusColor}>{subscription.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Current period started</span>
                  <span className="font-medium text-white">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Next billing date</span>
                  <span className="font-medium text-white">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Billing amount</span>
                  <span className="font-medium text-white">
                    {formatCurrency(plan.price)}/{intervalLabel}
                  </span>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <div className="text-sm text-amber-200">
                        Your subscription will be cancelled at the end of the current billing period on{" "}
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </details>

        {/* Action Buttons */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Button href={`/mentors/${mentor.id}`} variant="ghost">
            View Mentor Profile
          </Button>
          <Button href="/dashboard" variant="ghost">
            Back to Dashboard
          </Button>
          {subscription.status === "ACTIVE" && (
            <Button
              href={`https://billing.stripe.com/p/login/test_placeholder`}
              variant="primary"
              target="_blank"
            >
              Manage Billing
            </Button>
          )}
        </div>

        {/* Cancellation Info */}
        {subscription.status === "ACTIVE" && !subscription.cancelAtPeriodEnd && (
          <p className="mt-6 text-center text-sm text-white/50">
            To cancel your subscription, use the &quot;Manage Billing&quot; button above to access your
            billing portal.
          </p>
        )}
      </div>
    </section>
  );
}
