// app/subscription/[id]/success/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/format";
import { CheckCircle, ExternalLink, Calendar } from "lucide-react";

type Params = {
  id: string; // subscription ID
};

export default async function SubscriptionSuccessPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const session = await auth();

  // Require authentication
  if (!session?.user?.email) {
    redirect(`/signin?callbackUrl=/subscription/${id}/success`);
  }

  // Get user
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
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
        },
      },
    },
  });

  if (!subscription) {
    notFound();
  }

  // Verify subscription belongs to user
  if (subscription.userId !== user.id) {
    notFound();
  }

  const plan = subscription.plan;
  const mentor = subscription.mentor;
  const accessLinks = Array.isArray(plan.accessLinks)
    ? (plan.accessLinks as Array<{ title: string; url: string }>)
    : [];

  const intervalLabel =
    plan.interval === "WEEKLY"
      ? "week"
      : plan.interval === "MONTHLY"
      ? "month"
      : "year";

  return (
    <section className="section">
      <div className="container max-w-3xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="h1 mb-2">Subscription Active!</h1>
          <p className="text-lg text-white/70">
            You&apos;re now subscribed to {mentor.name}&apos;s {plan.name}
          </p>
        </div>

        {/* Subscription Details */}
        <Card className="mb-6">
          <CardContent>
            <div className="mb-6 flex items-center gap-4 border-b border-white/10 pb-6">
              {/* Mentor Image */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                {mentor.profileImage ? (
                  <Image
                    src={mentor.profileImage}
                    alt={mentor.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white">
                    {mentor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Plan Info */}
              <div className="flex-1">
                <h2 className="mb-1 text-xl font-semibold">{plan.name}</h2>
                <p className="text-sm text-white/60">with {mentor.name}</p>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-2xl font-bold">{formatCurrency(plan.price)}</div>
                <div className="text-sm text-white/60">/{intervalLabel}</div>
              </div>
            </div>

            {/* Billing Info */}
            <div className="mb-6 space-y-3 rounded-lg bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Status</span>
                <span className="font-medium text-green-400">Active</span>
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
            </div>

            {/* Welcome Message */}
            {plan.welcomeMessage && (
              <div className="mb-6 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                <h3 className="mb-2 font-semibold text-purple-200">
                  Welcome Message from {mentor.name}
                </h3>
                <p className="whitespace-pre-wrap text-sm text-white/70">
                  {plan.welcomeMessage}
                </p>
              </div>
            )}

            {/* Access Links */}
            {accessLinks.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-white/90">Your Resources</h3>
                <div className="space-y-2">
                  {accessLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:border-purple-500/50 hover:bg-white/10"
                    >
                      <span className="font-medium text-white">{link.title}</span>
                      <ExternalLink className="h-4 w-4 text-white/60" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* What happens next */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <h3 className="mb-3 font-semibold text-blue-200">What happens next?</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    You&apos;ll be automatically billed {formatCurrency(plan.price)} every{" "}
                    {intervalLabel}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>Access all resources and links anytime from your dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>Cancel anytime - you&apos;ll keep access until the end of your billing period</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button href="/dashboard" variant="primary" className="flex-1">
            Go to Dashboard
          </Button>
          <Button href={`/subscription/${id}`} variant="ghost" className="flex-1">
            View Subscription
          </Button>
        </div>

        {/* Email Confirmation */}
        <p className="mt-6 text-center text-sm text-white/50">
          📧 A confirmation email has been sent to {session.user.email}
        </p>
      </div>
    </section>
  );
}
