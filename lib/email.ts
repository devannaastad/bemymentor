// lib/email.ts
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ApplicationConfirmationEmail } from "./emails/application-confirmation";
import { AdminNotificationEmail } from "./emails/admin-notification";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "BeMyMentor <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "devannaastad@gmail.com";

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