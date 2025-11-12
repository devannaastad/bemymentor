// app/api/conversations/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/conversations
 * Get all conversations (bookings with messages) for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        mentorProfile: { select: { id: true } }
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Get all bookings where user is either student or mentor, and have messages
    const bookings = await db.booking.findMany({
      where: {
        OR: [
          { userId: user.id },
          { mentor: { userId: user.id } },
        ],
        messages: {
          some: {},
        },
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            userId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: user.id },
              },
            },
          },
        },
      },
      orderBy: {
        messages: {
          _count: "desc",
        },
      },
    });

    // Format conversations
    const conversations = bookings.map((booking) => {
      const isStudent = booking.userId === user.id;
      const otherPerson = isStudent
        ? { name: booking.mentor.name, image: booking.mentor.profileImage }
        : { name: booking.user.name, image: booking.user.image };

      const lastMessage = booking.messages[0];
      const unreadCount = booking._count.messages;

      return {
        bookingId: booking.id,
        bookingType: booking.type,
        scheduledAt: booking.scheduledAt,
        otherPerson,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isFromMe: lastMessage.senderId === user.id,
        } : null,
        unreadCount,
      };
    });

    return NextResponse.json({
      ok: true,
      data: { conversations },
    });
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
