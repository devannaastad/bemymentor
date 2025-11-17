// app/api/messages/subscription/[subscriptionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { containsInappropriateContent } from "@/lib/content-moderation";

export const runtime = "nodejs";

/**
 * GET /api/messages/subscription/[subscriptionId]
 * Get all messages for a subscription
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, mentorProfile: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const { subscriptionId } = await params;

    // Verify user has access to this subscription
    const subscription = await db.userSubscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
        userId: true,
        mentorId: true,
        mentor: {
          select: {
            userId: true,
            name: true,
            profileImage: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ ok: false, error: "Subscription not found" }, { status: 404 });
    }

    // Check if user is either the subscriber or the mentor
    const isSubscriber = subscription.userId === user.id;
    const isMentor = user.mentorProfile?.id === subscription.mentorId;

    if (!isSubscriber && !isMentor) {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    // Get all messages for this subscription
    const messages = await db.message.findMany({
      where: { subscriptionId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read if they were sent by the other party
    const otherUserId = isSubscriber ? subscription.mentor.userId : subscription.userId;
    await db.message.updateMany({
      where: {
        subscriptionId,
        senderId: otherUserId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        messages,
        subscription: {
          id: subscription.id,
          subscriber: subscription.user,
          mentor: {
            id: subscription.mentorId,
            userId: subscription.mentor.userId,
            name: subscription.mentor.name,
            profileImage: subscription.mentor.profileImage,
          },
        },
        currentUserId: user.id,
      },
    });
  } catch (error) {
    console.error("[api/messages/subscription] GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/subscription/[subscriptionId]
 * Send a new message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, mentorProfile: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const { subscriptionId } = await params;
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Message cannot be empty" }, { status: 400 });
    }

    // Check for inappropriate content
    const moderationResult = containsInappropriateContent(content);
    if (moderationResult.isInappropriate) {
      return NextResponse.json(
        {
          ok: false,
          error: moderationResult.reason || "Message contains inappropriate content",
        },
        { status: 400 }
      );
    }

    // Verify user has access to this subscription
    const subscription = await db.userSubscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
        userId: true,
        mentorId: true,
        mentor: {
          select: {
            userId: true,
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ ok: false, error: "Subscription not found" }, { status: 404 });
    }

    // Check if user is either the subscriber or the mentor
    const isSubscriber = subscription.userId === user.id;
    const isMentor = user.mentorProfile?.id === subscription.mentorId;

    if (!isSubscriber && !isMentor) {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    // Create the message
    const message = await db.message.create({
      data: {
        subscriptionId,
        mentorId: subscription.mentorId,
        senderId: user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create notification for the recipient
    const recipientId = isSubscriber ? subscription.mentor.userId : subscription.userId;
    const senderName = user.name || "Someone";

    await db.notification.create({
      data: {
        userId: recipientId,
        type: "BOOKING_UPDATE", // Reusing this type for now
        title: "New subscription message",
        message: `${senderName} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`,
        link: `/subscription/${subscriptionId}?tab=messages`,
      },
    });

    console.log(`[api/messages/subscription] Message sent from ${user.id} to ${recipientId} for subscription ${subscriptionId}`);

    return NextResponse.json({
      ok: true,
      data: { message },
    });
  } catch (error) {
    console.error("[api/messages/subscription] POST error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
