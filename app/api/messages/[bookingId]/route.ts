// app/api/messages/[bookingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { containsInappropriateContent } from "@/lib/content-moderation";

export const runtime = "nodejs";

/**
 * GET /api/messages/[bookingId]
 * Get all messages for a booking
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
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

    const { bookingId } = await params;

    // Verify user has access to this booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
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

    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    // Check if user is either the student or the mentor
    const isStudent = booking.userId === user.id;
    const isMentor = user.mentorProfile?.id === booking.mentorId;

    if (!isStudent && !isMentor) {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    // Get all messages for this booking
    const messages = await db.message.findMany({
      where: { bookingId },
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
    const otherUserId = isStudent ? booking.mentor.userId : booking.userId;
    await db.message.updateMany({
      where: {
        bookingId,
        senderId: otherUserId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Also mark any message notifications for this booking as read
    await db.notification.updateMany({
      where: {
        userId: user.id,
        bookingId,
        type: "BOOKING_UPDATE",
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
        booking: {
          id: booking.id,
          student: booking.user,
          mentor: {
            id: booking.mentorId,
            userId: booking.mentor.userId,
            name: booking.mentor.name,
            profileImage: booking.mentor.profileImage,
          },
        },
        currentUserId: user.id,
      },
    });
  } catch (error) {
    console.error("[api/messages] GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/[bookingId]
 * Send a new message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
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

    const { bookingId } = await params;
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

    // Verify user has access to this booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
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

    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
    }

    // Check if user is either the student or the mentor
    const isStudent = booking.userId === user.id;
    const isMentor = user.mentorProfile?.id === booking.mentorId;

    if (!isStudent && !isMentor) {
      return NextResponse.json({ ok: false, error: "Access denied" }, { status: 403 });
    }

    // Create the message
    const message = await db.message.create({
      data: {
        bookingId,
        mentorId: booking.mentorId,
        senderId: user.id,
        content: content.trim(),
        isRead: false,
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
    const recipientId = isStudent ? booking.mentor.userId : booking.userId;
    const senderName = user.name || "Someone";

    // First, delete any existing unread message notifications for this booking
    // This prevents duplicate notifications for the same conversation
    await db.notification.deleteMany({
      where: {
        userId: recipientId,
        bookingId,
        type: "BOOKING_UPDATE",
        isRead: false,
      },
    });

    // Now create the new notification
    await db.notification.create({
      data: {
        userId: recipientId,
        bookingId,
        type: "BOOKING_UPDATE",
        title: "New message",
        message: `${senderName} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`,
        link: `/bookings/${bookingId}/confirm?tab=messages`,
      },
    });

    console.log(`[api/messages] Message sent from ${user.id} to ${recipientId} for booking ${bookingId}`);

    return NextResponse.json({
      ok: true,
      data: { message },
    });
  } catch (error) {
    console.error("[api/messages] POST error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
