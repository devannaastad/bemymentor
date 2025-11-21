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
        subscription: {
          select: {
            id: true,
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

    const { type, bookingId, subscriptionId, rating, comment } = validation.data;

    let mentorId: string;
    let existingReview = null;

    // Handle SESSION and CONTENT_PASS reviews (both use bookingId)
    if (type === "SESSION" || type === "CONTENT_PASS") {
      if (!bookingId) {
        return NextResponse.json(
          { ok: false, error: "bookingId is required for SESSION and CONTENT_PASS reviews" },
          { status: 400 }
        );
      }

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
          { ok: false, error: "You can only review your own purchases" },
          { status: 403 }
        );
      }

      // For SESSION reviews, check if completed
      if (type === "SESSION" && booking.status !== "COMPLETED") {
        return NextResponse.json(
          { ok: false, error: "You can only review completed sessions" },
          { status: 400 }
        );
      }

      // For CONTENT_PASS reviews, check if it's actually a content pass booking
      if (type === "CONTENT_PASS" && booking.type !== "ACCESS") {
        return NextResponse.json(
          { ok: false, error: "This booking is not a content pass purchase" },
          { status: 400 }
        );
      }

      // For SESSION reviews, check if it's actually a session booking
      if (type === "SESSION" && booking.type !== "SESSION") {
        return NextResponse.json(
          { ok: false, error: "This booking is not a session" },
          { status: 400 }
        );
      }

      existingReview = booking.review;
      mentorId = booking.mentorId;
    }
    // Handle SUBSCRIPTION reviews
    else if (type === "SUBSCRIPTION") {
      if (!subscriptionId) {
        return NextResponse.json(
          { ok: false, error: "subscriptionId is required for SUBSCRIPTION reviews" },
          { status: 400 }
        );
      }

      const subscription = await db.userSubscription.findUnique({
        where: { id: subscriptionId },
        include: {
          reviews: {
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!subscription) {
        return NextResponse.json(
          { ok: false, error: "Subscription not found" },
          { status: 404 }
        );
      }

      if (subscription.userId !== user.id) {
        return NextResponse.json(
          { ok: false, error: "You can only review your own subscriptions" },
          { status: 403 }
        );
      }

      if (subscription.status !== "ACTIVE") {
        return NextResponse.json(
          { ok: false, error: "You can only review active subscriptions" },
          { status: 400 }
        );
      }

      // Check if user already reviewed this subscription in the last 30 days
      if (subscription.reviews.length > 0) {
        const lastReview = subscription.reviews[0];
        const daysSinceLastReview = Math.floor(
          (Date.now() - lastReview.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastReview < 30) {
          return NextResponse.json(
            { ok: false, error: `You can review this subscription again in ${30 - daysSinceLastReview} days` },
            { status: 400 }
          );
        }
      }

      mentorId = subscription.mentorId;
    } else {
      return NextResponse.json(
        { ok: false, error: "Invalid review type" },
        { status: 400 }
      );
    }

    // Check if review already exists (for SESSION and CONTENT_PASS only)
    if (existingReview) {
      return NextResponse.json(
        { ok: false, error: "You have already reviewed this purchase" },
        { status: 400 }
      );
    }

    // Create the review
    const review = await db.review.create({
      data: {
        type,
        bookingId: bookingId || null,
        subscriptionId: subscriptionId || null,
        userId: user.id,
        mentorId,
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
    await updateMentorRating(mentorId);

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
