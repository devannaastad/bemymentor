// app/subscribe/[mentorId]/[planId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import SubscriptionCheckoutForm from "@/components/subscription/SubscriptionCheckoutForm";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/format";

type Params = {
  mentorId: string;
  planId: string;
};

export default async function SubscriptionCheckoutPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { mentorId, planId } = await params;
  const session = await auth();

  // Require authentication
  if (!session?.user?.email) {
    redirect(`/signin?callbackUrl=/subscribe/${mentorId}/${planId}`);
  }

  // Fetch mentor and subscription plan
  const mentor = await db.mentor.findUnique({
    where: { id: mentorId, isActive: true },
    include: {
      subscriptionPlans: {
        where: { id: planId, isActive: true },
      },
    },
  });

  if (!mentor || mentor.subscriptionPlans.length === 0) {
    notFound();
  }

  const plan = mentor.subscriptionPlans[0];
  const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];

  // Get user data
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  // Check if user already has an active subscription to this plan
  const existingSubscription = await db.userSubscription.findFirst({
    where: {
      userId: user.id,
      planId: plan.id,
      status: "ACTIVE",
    },
  });

  if (existingSubscription) {
    redirect(`/dashboard?message=You already have an active subscription to this plan`);
  }

  const intervalLabel =
    plan.interval === "WEEKLY" ? "week" : plan.interval === "MONTHLY" ? "month" : "year";

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="h1 mb-2">Subscribe to {mentor.name}</h1>
          <p className="text-white/70">
            Complete your subscription to get started with {plan.name}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Subscription Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent>
                <h2 className="mb-4 text-lg font-semibold">Subscription Summary</h2>

                {/* Mentor Info */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    {mentor.profileImage ? (
                      <Image
                        src={mentor.profileImage}
                        alt={mentor.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">
                        {mentor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{mentor.name}</p>
                    <p className="text-sm text-white/60">{mentor.tagline}</p>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="mb-4 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                  <h3 className="mb-2 font-semibold text-white">{plan.name}</h3>
                  {plan.description && (
                    <p className="mb-3 text-sm text-white/60">{plan.description}</p>
                  )}
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(plan.price)}
                    <span className="text-sm font-normal text-white/60">/{intervalLabel}</span>
                  </div>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold text-white/80">What&apos;s included:</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-400">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 space-y-2 text-xs text-white/50">
                  <p>• You will be charged {formatCurrency(plan.price)} every {intervalLabel}</p>
                  <p>• You can cancel anytime</p>
                  <p>• Cancel before renewal to avoid next charge</p>
                  <p>• Platform fee: 15% (mentor receives 85%)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <SubscriptionCheckoutForm
              mentorId={mentor.id}
              planId={plan.id}
              userId={user.id}
              amount={plan.price}
              interval={plan.interval}
              planName={plan.name}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
