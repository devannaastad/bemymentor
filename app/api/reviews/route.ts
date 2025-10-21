// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createReviewSchema } from "@/lib/schemas/review";

export const runtime = "nodejs";

/**
 * GET /api/reviews?mentorId=xxx
 * Get all reviews for a specific mentor
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mentorId = searchParams.get("mentorId");

    if (!mentorId) {
      return NextResponse.json(
        { ok: false, error: "mentorId is required" },
        { status: 400 }
      );
    }

    const reviews = await db.review.findMany({
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

    return NextResponse.json(
      { ok: true, data: reviews },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=60" } }
    );
  } catch (err) {
    console.error("[api/reviews] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Create a new review (only for completed bookings)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { bookingId, rating, comment } = validation.data;

    // Verify booking exists, belongs to user, and is completed
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true, // Check if review already exists
      },
    });

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.userId !== user.id) {
      return NextResponse.json(
        { ok: false, error: "You can only review your own bookings" },
        { status: 403 }
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { ok: false, error: "You can only review completed bookings" },
        { status: 400 }
      );
    }

    if (booking.review) {
      return NextResponse.json(
        { ok: false, error: "You have already reviewed this booking" },
        { status: 400 }
      );
    }

    // Create the review
    const review = await db.review.create({
      data: {
        bookingId,
        userId: user.id,
        mentorId: booking.mentorId,
        rating,
        comment: comment || null,
        isVerifiedPurchase: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update mentor's rating and review count
    await updateMentorRating(booking.mentorId);

    console.log("[api/reviews] Created review:", review.id);

    return NextResponse.json(
      { ok: true, data: review },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/reviews] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * Helper function to update mentor's average rating and review count
 */
async function updateMentorRating(mentorId: string) {
  // Get all reviews for this mentor
  const reviews = await db.review.findMany({
    where: { mentorId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return;
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  // Update mentor
  await db.mentor.update({
    where: { id: mentorId },
    data: {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviews: reviews.length,
    },
  });
}
