// app/bookings/[id]/confirm/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Image from "next/image";
import PaymentButton from "@/components/booking/PaymentButton";

type Params = { id: string };
type SearchParams = {
  session_id?: string;
  canceled?: string;
};

export default async function BookingConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const { id } = await params;
  const sp = (await searchParams) || {};
  const paymentCanceled = sp.canceled === "true";
  const paymentCompleted = !!sp.session_id;

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    redirect("/signin");
  }

  const booking = await db.booking.findUnique({
    where: { id, userId: user.id },
    include: {
      mentor: {
        select: {
          id: true,
          name: true,
          category: true,
          tagline: true,
          profileImage: true,
        },
      },
    },
  });

  if (!booking) notFound();

  const formattedPrice = (booking.totalPrice / 100).toFixed(2);
  const scheduledDate = booking.scheduledAt
    ? new Date(booking.scheduledAt).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : null;

  const isPaid = booking.status === "CONFIRMED" && booking.stripePaidAt;
  const isPending = booking.status === "PENDING" && !booking.stripePaymentIntentId;

  return (
    <section className="section">
      <div className="container max-w-3xl">
        {/* Success/Status Header */}
        {isPaid ? (
          <Card className="mb-8 border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="text-center">
              <div className="mb-4 text-6xl">✅</div>
              <h1 className="h2 mb-2">Payment Successful!</h1>
              <p className="text-white/70">
                Your booking is confirmed. {booking.type === "ACCESS"
                  ? "You'll receive access details shortly."
                  : "You'll receive a calendar invite and meeting link soon."}
              </p>
            </CardContent>
          </Card>
        ) : paymentCanceled ? (
          <Card className="mb-8 border-amber-500/20 bg-amber-500/5">
            <CardContent className="text-center">
              <div className="mb-4 text-6xl">⚠️</div>
              <h1 className="h2 mb-2">Payment Canceled</h1>
              <p className="text-white/70">
                Your booking is saved but not confirmed. Complete payment below to confirm.
              </p>
            </CardContent>
          </Card>
        ) : isPending ? (
          <Card className="mb-8 border-blue-500/20 bg-blue-500/5">
            <CardContent className="text-center">
              <div className="mb-4 text-6xl">💳</div>
              <h1 className="h2 mb-2">Complete Your Booking</h1>
              <p className="text-white/70">
                Your booking is created. Complete payment to confirm.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="text-center">
              <div className="mb-4 text-6xl">✅</div>
              <h1 className="h2 mb-2">Booking Confirmed!</h1>
              <p className="text-white/70">
                Your booking has been confirmed and is being processed.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Booking Details */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="mb-6 text-xl font-semibold">Booking Details</h2>

            <div className="grid gap-6">
              {/* Mentor Info */}
              <div className="flex items-start gap-4">
                {booking.mentor.profileImage && (
                  <Image
                    src={booking.mentor.profileImage}
                    alt={booking.mentor.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{booking.mentor.name}</h3>
                  <p className="text-sm text-white/60">{booking.mentor.tagline}</p>
                  <Badge variant="outline" className="mt-2">
                    {booking.mentor.category}
                  </Badge>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Booking Type */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-white/60">Booking Type</p>
                  <p className="font-medium">
                    {booking.type === "ACCESS" ? "ACCESS Pass" : "1-on-1 Session"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/60">Status</p>
                  <Badge
                    variant={
                      booking.status === "CONFIRMED"
                        ? "success"
                        : booking.status === "PENDING"
                        ? "warning"
                        : "default"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              </div>

              {/* Session Details (if applicable) */}
              {booking.type === "SESSION" && scheduledDate && (
                <>
                  <div className="h-px bg-white/10" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-white/60">Scheduled For</p>
                      <p className="font-medium">{scheduledDate}</p>
                    </div>

                    <div>
                      <p className="text-sm text-white/60">Duration</p>
                      <p className="font-medium">{booking.durationMinutes} minutes</p>
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {booking.notes && (
                <>
                  <div className="h-px bg-white/10" />
                  <div>
                    <p className="mb-2 text-sm text-white/60">Your Notes</p>
                    <p className="rounded-lg bg-white/5 p-3 text-sm">{booking.notes}</p>
                  </div>
                </>
              )}

              <div className="h-px bg-white/10" />

              {/* Price */}
              <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
                <div>
                  <p className="text-sm text-white/60">Total Amount</p>
                  <p className="text-3xl font-bold">${formattedPrice}</p>
                </div>
                {isPaid ? (
                  <Badge variant="success">Paid</Badge>
                ) : (
                  <Badge variant="warning">Payment Pending</Badge>
                )}
              </div>

              {/* Payment Button - Only show if payment is pending */}
              {isPending && (
                <>
                  <div className="h-px bg-white/10" />
                  <div className="text-center">
                    <PaymentButton bookingId={booking.id} />
                  </div>
                </>
              )}

              {/* Info Box */}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <h3 className="mb-2 font-semibold text-blue-200">What&apos;s Next?</h3>
                <ul className="space-y-2 text-sm text-blue-100">
                  {isPaid ? (
                    booking.type === "ACCESS" ? (
                      <>
                        <li>• Check your email for access instructions and credentials</li>
                        <li>• Join the private community (link in email)</li>
                        <li>• Access all digital resources immediately</li>
                      </>
                    ) : (
                      <>
                        <li>• You&apos;ll receive a calendar invite via email</li>
                        <li>• The meeting link will be shared before the session</li>
                        <li>• The mentor may reach out with preparation materials</li>
                      </>
                    )
                  ) : (
                    booking.type === "ACCESS" ? (
                      <>
                        <li>• Complete payment to confirm your booking</li>
                        <li>• Once paid, you&apos;ll get instant access to all resources</li>
                        <li>• Check your email for access instructions</li>
                      </>
                    ) : (
                      <>
                        <li>• Complete payment to confirm your booking</li>
                        <li>• You&apos;ll receive a calendar invite and meeting link</li>
                        <li>• The mentor will contact you before the session</li>
                      </>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/dashboard" variant="primary">
            Go to Dashboard
          </Button>
          <Button href={`/mentors/${booking.mentor.id}`} variant="ghost">
            View Mentor Profile
          </Button>
          <Button href="/catalog" variant="ghost">
            Browse More Mentors
          </Button>
        </div>
      </div>
    </section>
  );
}