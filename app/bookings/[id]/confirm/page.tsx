// app/bookings/[id]/confirm/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Image from "next/image";
import PaymentButton from "@/components/booking/PaymentButton";
import StudentConfirmation from "@/components/booking/StudentConfirmation";
import AddToCalendarButton from "@/components/booking/AddToCalendarButton";
import BookingChat from "@/components/booking/BookingChat";

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
  const stripeSessionId = sp.session_id;

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      mentorProfile: {
        select: { id: true }
      }
    },
  });

  if (!user) {
    redirect("/signin");
  }

  // Fetch booking and check if user is either the student OR the mentor
  let booking = await db.booking.findFirst({
    where: {
      id,
      OR: [
        { userId: user.id }, // User is the student
        { mentor: { userId: user.id } } // User is the mentor
      ]
    },
    include: {
      mentor: {
        select: {
          id: true,
          name: true,
          category: true,
          tagline: true,
          profileImage: true,
          userId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        }
      }
    },
  });

  if (!booking) notFound();

  // Determine if current user is the mentor
  const isMentor = booking.mentor.userId === user.id;

  // If returning from Stripe with session_id, verify the payment
  if (stripeSessionId && booking.status === "PENDING") {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);

      // If payment was successful and booking hasn't been updated yet
      if (stripeSession.payment_status === "paid" && !booking.stripePaymentIntentId) {
        // Update booking to confirmed
        booking = await db.booking.update({
          where: { id },
          data: {
            stripePaymentIntentId: stripeSession.payment_intent as string,
            stripePaidAt: new Date(),
            status: "CONFIRMED",
          },
          include: {
            mentor: {
              select: {
                id: true,
                userId: true,
                name: true,
                category: true,
                tagline: true,
                profileImage: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
          },
        });

        console.log("[BookingConfirmPage] Payment verified and booking updated:", id);

        // Send confirmation emails to both student and mentor
        try {
          const { sendBookingConfirmation, sendMentorBookingNotification } = await import("@/lib/email");

          // Get mentor's user email
          const mentorUser = await db.user.findUnique({
            where: { id: booking.mentor.userId },
            select: { email: true, name: true },
          });

          // Send email to student
          await sendBookingConfirmation({
            to: booking.user.email!,
            userName: booking.user.name || "Student",
            mentorName: booking.mentor.name,
            bookingType: booking.type,
            totalAmount: booking.totalPrice,
            scheduledAt: booking.scheduledAt?.toISOString() || null,
            durationMinutes: booking.durationMinutes,
            bookingId: booking.id,
          });

          // Send email to mentor
          if (mentorUser?.email) {
            await sendMentorBookingNotification({
              to: mentorUser.email,
              mentorName: booking.mentor.name,
              userName: booking.user.name || "Student",
              userEmail: booking.user.email!,
              bookingType: booking.type,
              totalAmount: booking.totalPrice,
              scheduledAt: booking.scheduledAt?.toISOString() || null,
              durationMinutes: booking.durationMinutes,
              notes: booking.notes,
              bookingId: booking.id,
            });
          }

          console.log("[BookingConfirmPage] Confirmation emails sent for booking:", id);
        } catch (emailError) {
          console.error("[BookingConfirmPage] Failed to send confirmation emails:", emailError);
          // Don't fail the page - email is nice to have but not critical
        }
      }
    } catch (err) {
      console.error("[BookingConfirmPage] Failed to verify Stripe session:", err);
      // Don't fail the page - just log the error and continue
    }
  }

  // After payment verification, redirect ACCESS pass purchases to their exclusive content page
  if (stripeSessionId && booking.status === "CONFIRMED" && booking.type === "ACCESS" && booking.stripePaidAt) {
    redirect(`/access-pass/${booking.mentor.id}`);
  }

  const formattedPrice = (booking.totalPrice / 100).toFixed(2);
  const scheduledDate = booking.scheduledAt
    ? new Date(booking.scheduledAt).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : null;

  const bookingStatus = booking.status;
  const isPaid = bookingStatus === "CONFIRMED" && booking.stripePaidAt;
  const isPending = bookingStatus === "PENDING" && !booking.stripePaymentIntentId;
  const isCompleted = bookingStatus === "COMPLETED";
  const showMessages = (isPaid || isCompleted) || (isMentor && (bookingStatus === "CONFIRMED" || isCompleted));

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

                  {/* Meeting Link - Prominently displayed */}
                  {booking.status === "CONFIRMED" && (
                    <>
                      <div className="h-px bg-white/10" />
                      {booking.meetingLink ? (
                        <div className="rounded-lg border-2 border-primary-500/30 bg-primary-500/10 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-2xl">🎥</span>
                            <h3 className="text-lg font-semibold text-primary-300">Join Your Session</h3>
                          </div>
                          <p className="mb-3 text-sm text-white/70">
                            Click the link below to join your video call at the scheduled time:
                          </p>
                          <div className="mb-3 rounded-lg bg-white/5 p-3">
                            <a
                              href={booking.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              {booking.meetingLink}
                            </a>
                          </div>
                          <Button
                            href={booking.meetingLink}
                            variant="primary"
                            size="lg"
                            target="_blank"
                            className="w-full"
                          >
                            Join Meeting Now 🎥
                          </Button>
                          <p className="mt-2 text-xs text-white/50 text-center">
                            You&apos;ll receive reminder notifications 1 hour and 15 minutes before the session
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-lg border-2 border-amber-500/30 bg-amber-500/10 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-2xl">⏳</span>
                            <h3 className="text-lg font-semibold text-amber-300">Meeting Link Pending</h3>
                          </div>
                          <p className="text-sm text-white/70">
                            The mentor will add the meeting link soon. You&apos;ll receive a notification
                            when it&apos;s available. Check back here or your email for updates.
                          </p>
                        </div>
                      )}
                    </>
                  )}
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

        {/* Add to Calendar - Only show for paid SESSION bookings */}
        {isPaid && booking.type === "SESSION" && booking.scheduledAt && booking.durationMinutes && (
          <Card className="mb-8 border-primary-500/20 bg-primary-500/5">
            <CardContent>
              <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">📅</span>
                Add to Your Calendar
              </h3>
              <p className="mb-4 text-sm text-white/70">
                Save this session to your calendar and get reminded 30 minutes before it starts.
              </p>
              <AddToCalendarButton
                title={`1-on-1 Session with ${booking.mentor.name}`}
                description={`${booking.durationMinutes}-minute coaching session with ${booking.mentor.name}${booking.notes ? `\n\nNotes: ${booking.notes}` : ""}`}
                location="Online (Meeting link will be shared via email)"
                startTime={new Date(booking.scheduledAt)}
                endTime={new Date(new Date(booking.scheduledAt).getTime() + booking.durationMinutes * 60000)}
                mentorName={booking.mentor.name}
              />
            </CardContent>
          </Card>
        )}

        {/* Student Confirmation - Only show for COMPLETED SESSION bookings that are paid */}
        {booking.status === "COMPLETED" && booking.type === "SESSION" && isPaid && (
          <div className="mb-8">
            <StudentConfirmation
              bookingId={booking.id}
              mentorName={booking.mentor.name}
              mentorCompletedAt={booking.mentorCompletedAt}
              studentConfirmedAt={booking.studentConfirmedAt}
              autoConfirmAt={booking.autoConfirmAt}
              isFraudReported={booking.isFraudReported}
            />
          </div>
        )}

        {/* Messages - Show for all bookings after payment or for mentors */}
        {showMessages && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">Messages</h3>
              <p className="text-sm text-white/60 mb-4">
                {isMentor
                  ? `Chat with ${booking.user.name || "your student"} about this booking`
                  : `Chat with ${booking.mentor.name} about your booking`
                }
              </p>
              <BookingChat bookingId={booking.id} />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {isPaid && booking.type === "ACCESS" && (
            <Button href={`/access-pass/${booking.mentor.id}`} variant="primary">
              Access Your Content
            </Button>
          )}
          <Button href="/dashboard" variant={isPaid && booking.type === "ACCESS" ? "ghost" : "primary"}>
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