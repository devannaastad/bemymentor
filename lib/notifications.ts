// lib/notifications.ts
import { db } from "@/lib/db";

export type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_COMPLETED"
  | "REVIEW_RECEIVED"
  | "MENTOR_APPROVED"
  | "PAYMENT_RECEIVED"
  | "SESSION_REMINDER_24H"
  | "SESSION_REMINDER_1H"
  | "SESSION_REMINDER_15MIN"
  | "SESSION_COMPLETION_REMINDER"
  | "REVIEW_REMINDER";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const count = await db.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Failed to get unread count:", error);
    return 0;
  }
}

export async function getUserNotifications(userId: string, limit = 20) {
  try {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return notifications;
  } catch (error) {
    console.error("Failed to get user notifications:", error);
    return [];
  }
}

export async function markAsRead(notificationId: string) {
  try {
    await db.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return false;
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await db.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to mark all as read:", error);
    return false;
  }
}

// Helper functions for common notification types
export async function notifyBookingConfirmed(
  userId: string,
  mentorName: string,
  bookingId: string
) {
  return createNotification({
    userId,
    type: "BOOKING_CONFIRMED",
    title: "Booking Confirmed",
    message: `Your session with ${mentorName} has been confirmed.`,
    link: `/bookings/${bookingId}`,
  });
}

export async function notifyBookingCancelled(
  userId: string,
  mentorName: string,
  bookingId: string
) {
  return createNotification({
    userId,
    type: "BOOKING_CANCELLED",
    title: "Booking Cancelled",
    message: `Your booking with ${mentorName} has been cancelled.`,
    link: `/bookings/${bookingId}`,
  });
}

export async function notifyBookingRescheduled(
  userId: string,
  mentorName: string,
  newDateFormatted: string, // Pre-formatted date string with timezone
  bookingId: string
) {
  return createNotification({
    userId,
    type: "BOOKING_RESCHEDULED",
    title: "Booking Rescheduled",
    message: `Your session with ${mentorName} has been rescheduled to ${newDateFormatted}.`,
    link: `/bookings/${bookingId}`,
  });
}

export async function notifyReviewReceived(
  mentorUserId: string,
  studentName: string,
  rating: number
) {
  return createNotification({
    userId: mentorUserId,
    type: "REVIEW_RECEIVED",
    title: "New Review Received",
    message: `${studentName} left you a ${rating}-star review.`,
    link: "/mentor-dashboard",
  });
}

export async function notifyMentorApproved(userId: string) {
  return createNotification({
    userId,
    type: "MENTOR_APPROVED",
    title: "Mentor Application Approved",
    message: "Congratulations! Your mentor application has been approved. Complete your onboarding to start.",
    link: "/mentor/onboarding",
  });
}
