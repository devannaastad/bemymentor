// app/api/user/conversations/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/user/conversations
 * Get all conversations (bookings, subscriptions) for a user
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Get all messages where this user is the sender
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          {
            booking: {
              userId: user.id,
            },
          },
          {
            subscription: {
              userId: user.id,
            },
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            userId: true,
          },
        },
        booking: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            mentorId: true,
          },
        },
        subscription: {
          select: {
            id: true,
            status: true,
            mentorId: true,
            plan: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group messages by conversation type and ID
    type Conversation = {
      type: "booking" | "subscription";
      id: string;
      mentor: {
        id: string;
        userId: string;
        name: string;
        profileImage: string | null;
      };
      lastMessage: {
        content: string;
        createdAt: Date;
        senderId: string;
        isRead: boolean;
      };
      unreadCount: number;
      metadata?: {
        bookingDate?: Date;
        bookingStatus?: string;
        planName?: string;
        subscriptionStatus?: string;
      };
    };

    const conversationMap = new Map<string, Conversation>();

    for (const message of messages) {
      let key: string;
      let type: "booking" | "subscription";
      let conversationMentor: Conversation["mentor"];
      let metadata: Conversation["metadata"] = {};

      if (message.bookingId && message.booking) {
        key = `booking-${message.bookingId}`;
        type = "booking";
        conversationMentor = {
          id: message.mentor.id,
          userId: message.mentor.userId,
          name: message.mentor.name,
          profileImage: message.mentor.profileImage,
        };
        metadata = {
          bookingDate: message.booking.scheduledAt || undefined,
          bookingStatus: message.booking.status,
        };
      } else if (message.subscriptionId && message.subscription) {
        key = `subscription-${message.subscriptionId}`;
        type = "subscription";
        conversationMentor = {
          id: message.mentor.id,
          userId: message.mentor.userId,
          name: message.mentor.name,
          profileImage: message.mentor.profileImage,
        };
        metadata = {
          planName: message.subscription.plan.name,
          subscriptionStatus: message.subscription.status,
        };
      } else {
        continue; // Skip if message doesn't have booking or subscription
      }

      const existing = conversationMap.get(key);

      if (!existing) {
        conversationMap.set(key, {
          type,
          id: message.bookingId || message.subscriptionId || "",
          mentor: conversationMentor,
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
            isRead: message.isRead,
          },
          unreadCount: !message.isRead && message.senderId !== user.id ? 1 : 0,
          metadata,
        });
      } else {
        // Update unread count
        if (!message.isRead && message.senderId !== user.id) {
          existing.unreadCount += 1;
        }
      }
    }

    // Convert map to array and sort by last message time
    const conversationList = Array.from(conversationMap.values()).sort(
      (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    );

    return NextResponse.json({
      ok: true,
      data: {
        conversations: conversationList,
        totalUnread: conversationList.reduce((sum, c) => sum + c.unreadCount, 0),
      },
    });
  } catch (error) {
    console.error("[api/user/conversations] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
