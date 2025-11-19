// app/api/mentor/conversations/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/mentor/conversations
 * Get all conversations (bookings, subscriptions, access passes) for a mentor
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

    if (!user?.mentorProfile) {
      return NextResponse.json({ ok: false, error: "Not a mentor" }, { status: 403 });
    }

    const mentorId = user.mentorProfile.id;

    // Get all messages for this mentor
    const messages = await db.message.findMany({
      where: { mentorId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        booking: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        subscription: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
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
      user: {
        id: string;
        name: string | null;
        image: string | null;
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
      let conversationUser: Conversation["user"];
      let metadata: Conversation["metadata"] = {};

      if (message.bookingId && message.booking) {
        key = `booking-${message.bookingId}`;
        type = "booking";
        conversationUser = message.booking.user;
        metadata = {
          bookingDate: message.booking.scheduledAt || undefined,
          bookingStatus: message.booking.status,
        };
      } else if (message.subscriptionId && message.subscription) {
        key = `subscription-${message.subscriptionId}`;
        type = "subscription";
        conversationUser = message.subscription.user;
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
          user: conversationUser,
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

    // Debug logging
    console.log('[mentor/conversations] User ID:', user.id);
    conversationList.forEach(conv => {
      console.log(`[mentor/conversations] Conversation ${conv.id}:`, {
        unreadCount: conv.unreadCount,
        lastMessageSenderId: conv.lastMessage.senderId,
        lastMessageIsRead: conv.lastMessage.isRead,
        lastMessageContent: conv.lastMessage.content.substring(0, 30)
      });
    });

    return NextResponse.json({
      ok: true,
      data: {
        conversations: conversationList,
        totalUnread: conversationList.reduce((sum, c) => sum + c.unreadCount, 0),
      },
    });
  } catch (error) {
    console.error("[api/mentor/conversations] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
