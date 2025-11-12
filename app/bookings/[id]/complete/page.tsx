// app/bookings/[id]/complete/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import SessionCompleteSurvey from "@/components/booking/SessionCompleteSurvey";

export default async function SessionCompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id: bookingId } = await params;

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      mentor: {
        select: {
          name: true,
          profileImage: true,
        },
      },
      user: true,
    },
  });

  if (!booking) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Booking Not Found</h1>
          <p className="text-white/60">This booking does not exist.</p>
        </div>
      </div>
    );
  }

  // Verify user owns this booking
  if (booking.user.email !== session.user.email) {
    redirect("/dashboard");
  }

  // Check if already completed
  if (booking.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Already Completed</h1>
          <p className="text-white/60 mb-6">
            You&apos;ve already marked this session as complete. Thank you for your feedback!
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-medium"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Only CONFIRMED bookings can be completed
  if (booking.status !== "CONFIRMED") {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">Session Not Ready</h1>
          <p className="text-white/60 mb-6">
            This session must be confirmed before it can be marked as complete.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition font-medium"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <SessionCompleteSurvey booking={booking} />
      </div>
    </div>
  );
}
