// lib/email.ts
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ApplicationConfirmationEmail } from "./emails/application-confirmation";
import { AdminNotificationEmail } from "./emails/admin-notification";
import { BookingConfirmationEmail } from "./emails/booking-confirmation";
import { MentorBookingNotificationEmail } from "./emails/mentor-booking-notification";
import BookingCancellationEmail from "./emails/booking-cancellation";
import BookingRescheduleEmail from "./emails/booking-reschedule";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "BeMyMentor <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "devannaastad@gmail.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendApplicationConfirmation({
  to,
  applicantName,
  topic,
}: {
  to: string;
  applicantName: string;
  topic: string;
}) {
  try {
    const emailHtml = await render(
      ApplicationConfirmationEmail({ applicantName, topic })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Application Received - BeMyMentor",
      html: emailHtml,
    });

    if (error) {
      console.error("[email:confirmation] Failed:", error);
      return { ok: false, error };
    }

    console.log("[email:confirmation] Sent to:", to, "ID:", data?.id);
    return { ok: true, data };
  } catch (error) {
    console.error("[email:confirmation] Exception:", error);
    return { ok: false, error };
  }
}

export async function sendAdminNotification({
  applicantName,
  applicantEmail,
  topic,
  offerType,
  accessPrice,
  hourlyRate,
  proofLinks,
  applicationId,
}: {
  applicantName: string;
  applicantEmail: string;
  topic: string;
  offerType: string;
  accessPrice?: number;
  hourlyRate?: number;
  proofLinks: string;
  applicationId: string;
}) {
  try {
    const emailHtml = await render(
      AdminNotificationEmail({
        applicantName,
        applicantEmail,
        topic,
        offerType,
        accessPrice,
        hourlyRate,
        proofLinks,
        applicationId,
        appUrl: APP_URL,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Mentor Application: ${applicantName} - ${topic}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[email:admin] Failed:", error);
      return { ok: false, error };
    }

    console.log("[email:admin] Sent to:", ADMIN_EMAIL, "ID:", data?.id);
    return { ok: true, data };
  } catch (error) {
    console.error("[email:admin] Exception:", error);
    return { ok: false, error };
  }
}

export async function sendBookingConfirmation({
  to,
  userName,
  mentorName,
  bookingType,
  totalAmount,
  scheduledAt,
  durationMinutes,
  bookingId,
}: {
  to: string;
  userName: string;
  mentorName: string;
  bookingType: "ACCESS" | "SESSION";
  totalAmount: number;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  bookingId: string;
}) {
  try {
    const emailHtml = await render(
      BookingConfirmationEmail({
        userName,
        mentorName,
        bookingType,
        totalAmount,
        scheduledAt,
        durationMinutes,
        bookingId,
        dashboardUrl: `${APP_URL}/dashboard`,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Confirmed with ${mentorName} - BeMyMentor`,
      html: emailHtml,
    });

    if (error) {
      console.error("[email:booking-confirmation] Failed:", error);
      return { ok: false, error };
    }

    console.log("[email:booking-confirmation] Sent to:", to, "ID:", data?.id);
    return { ok: true, data };
  } catch (error) {
    console.error("[email:booking-confirmation] Exception:", error);
    return { ok: false, error };
  }
}

export async function sendMentorBookingNotification({
  to,
  mentorName,
  userName,
  userEmail,
  bookingType,
  totalAmount,
  scheduledAt,
  durationMinutes,
  notes,
  bookingId,
}: {
  to: string;
  mentorName: string;
  userName: string;
  userEmail: string;
  bookingType: "ACCESS" | "SESSION";
  totalAmount: number;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  notes?: string | null;
  bookingId: string;
}) {
  try {
    const emailHtml = await render(
      MentorBookingNotificationEmail({
        mentorName,
        userName,
        userEmail,
        bookingType,
        totalAmount,
        scheduledAt,
        durationMinutes,
        notes,
        bookingId,
        dashboardUrl: `${APP_URL}/mentor-dashboard`,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Booking from ${userName} - BeMyMentor`,
      html: emailHtml,
    });

    if (error) {
      console.error("[email:mentor-notification] Failed:", error);
      return { ok: false, error };
    }

    console.log("[email:mentor-notification] Sent to:", to, "ID:", data?.id);
    return { ok: true, data };
  } catch (error) {
    console.error("[email:mentor-notification] Exception:", error);
    return { ok: false, error };
  }
}

export async function sendBookingCancellation({
  to,
  recipientName,
  bookingId,
  mentorName,
  sessionDate,
  sessionTime,
  cancellationReason,
  refundAmount,
  isMentor,
}: {
  to: string;
  recipientName: string;
  bookingId: string;
  mentorName: string;
  sessionDate?: string;
  sessionTime?: string;
  cancellationReason: string;
  refundAmount?: number;
  isMentor: boolean;
}) {
  try {
    const emailHtml = await render(
      BookingCancellationEmail({
        recipientName,
        bookingId,
        mentorName,
        sessionDate,
        sessionTime,
        cancellationReason,
        refundAmount,
        isMentor,
      })
    );

    const subject = isMentor
      ? `Booking Cancelled by Student - BeMyMentor`
      : `Booking Cancelled - BeMyMentor`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("[email:booking-cancellation] Failed:", error);
      return { ok: false, error };
    }

    console.log("[email:booking-cancellation] Sent to:", to, "ID:", data?.id);
    return { ok: true, data };
  } catch (error) {
    console.error("[email:booking-cancellation] Exception:", error);
    return { ok: false, error };
  }
}

export async function sendBookingReschedule({
  to,
  recipientName,
  bookingId,
  mentorName,
  oldDate,
  oldTime,
  newDate,
  newTime,
  reason,
  isMentor,
  initiatedByMentor,
}: {
  to: string;
  recipientName: string;
  bookingId: string;
  mentorName: string;
  oldDate?: string;
  oldTime?: string;
  newDate: string;
  newTime: string;
  reason?: string;
  isMentor: boolean;
  initiatedByMentor: boolean;
}) {
  try {
    const emailHtml = await render(
      BookingRescheduleEmail({
        recipientName,
        bookingId,
        mentorName,
        oldDate,
        oldTime,
        newDate,
        newTime,
        reason,
        isMentor,
        initiatedByMentor,
      })
    );

    const subject = isMentor
      ? initiatedByMentor
        ? `Session Rescheduled - BeMyMentor`
        : `Student Rescheduled Session - BeMyMentor`
      : `Session Rescheduled - BeMyMentor`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("[email:booking-reschedule] Failed:", error);
      return { ok: false, error };
    }

    console.log("[email:booking-reschedule] Sent to:", to, "ID:", data?.id);
    return { ok: true, data };
  } catch (error) {
    console.error("[email:booking-reschedule] Exception:", error);
    return { ok: false, error };
  }
}