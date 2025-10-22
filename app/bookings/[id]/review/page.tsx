// app/bookings/[id]/review/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/common/Card";
import ReviewForm from "@/components/reviews/ReviewForm";
import Badge from "@/components/common/Badge";
import Image from "next/image";

type Params = { id: string };

export default async function ReviewBookingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    redirect("/signin");
  }

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      mentor: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          category: true,
        },
      },
      review: true,
    },
  });

  if (!booking) {
    notFound();
  }

  // Verify ownership
  if (booking.userId !== user.id) {
    return (
      <section className="section">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="h1 mb-4">Unauthorized</h1>
              <p className="text-white/60">You don&apos;t have access to this booking.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Check if booking is completed
  if (booking.status !== "COMPLETED") {
    return (
      <section className="section">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="h1 mb-4">Not Available</h1>
              <p className="text-white/60 mb-4">
                You can only review completed bookings.
              </p>
              <Badge variant={booking.status === "CONFIRMED" ? "success" : "warning"}>
                Current Status: {booking.status}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Check if already reviewed
  if (booking.review) {
    return (
      <section className="section">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="text-center py-12">
              <h1 className="h1 mb-4">Already Reviewed</h1>
              <p className="text-white/60 mb-4">
                You&apos;ve already submitted a review for this booking.
              </p>
              <a
                href={`/mentors/${booking.mentor.id}`}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                View your review on {booking.mentor.name}&apos;s profile
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container max-w-2xl">
        {/* Booking Info */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center gap-4">
              {booking.mentor.profileImage && (
                <Image
                  src={booking.mentor.profileImage}
                  alt={booking.mentor.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{booking.mentor.name}</h2>
                <p className="text-sm text-white/60">
                  {booking.type === "ACCESS" ? "ACCESS Pass" : "1-on-1 Session"}
                  {booking.scheduledAt &&
                    ` • ${new Date(booking.scheduledAt).toLocaleDateString()}`}
                </p>
              </div>
              <Badge variant="success">COMPLETED</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card>
          <CardContent>
            <ReviewForm
              bookingId={booking.id}
              mentorName={booking.mentor.name}
              redirectUrl="/dashboard"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
