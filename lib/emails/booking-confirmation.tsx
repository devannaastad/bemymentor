// lib/emails/booking-confirmation.tsx
import * as React from "react";

interface BookingConfirmationEmailProps {
  userName: string;
  mentorName: string;
  bookingType: "ACCESS" | "SESSION";
  totalAmount: number; // in cents
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  bookingId: string;
  dashboardUrl: string;
}

export function BookingConfirmationEmail({
  userName,
  mentorName,
  bookingType,
  totalAmount,
  scheduledAt,
  durationMinutes,
  bookingId,
  dashboardUrl,
}: BookingConfirmationEmailProps) {
  const formattedAmount = (totalAmount / 100).toFixed(2);
  const formattedDate = scheduledAt
    ? new Date(scheduledAt).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : null;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#000", padding: "24px", textAlign: "center" }}>
        <h1 style={{ color: "#fff", margin: 0 }}>BeMyMentor</h1>
      </div>

      <div style={{ padding: "32px", backgroundColor: "#fff", color: "#000" }}>
        <div style={{ textAlign: "center", fontSize: "48px", marginBottom: "16px" }}>
          ✅
        </div>

        <h2 style={{ marginTop: 0, textAlign: "center" }}>
          Booking Confirmed!
        </h2>

        <p>Hi {userName},</p>

        <p>
          Great news! Your booking with <strong>{mentorName}</strong> has been confirmed and
          payment processed successfully.
        </p>

        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "2px solid #10b981",
            padding: "20px",
            borderRadius: "8px",
            margin: "24px 0",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#065f46" }}>Booking Details</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", color: "#666" }}>Mentor:</td>
                <td style={{ padding: "8px 0", fontWeight: "bold" }}>{mentorName}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#666" }}>Type:</td>
                <td style={{ padding: "8px 0", fontWeight: "bold" }}>
                  {bookingType === "ACCESS" ? "ACCESS Pass" : "1-on-1 Session"}
                </td>
              </tr>
              {formattedDate && (
                <tr>
                  <td style={{ padding: "8px 0", color: "#666" }}>Scheduled:</td>
                  <td style={{ padding: "8px 0", fontWeight: "bold" }}>{formattedDate}</td>
                </tr>
              )}
              {durationMinutes && (
                <tr>
                  <td style={{ padding: "8px 0", color: "#666" }}>Duration:</td>
                  <td style={{ padding: "8px 0", fontWeight: "bold" }}>
                    {durationMinutes} minutes
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ padding: "8px 0", color: "#666" }}>Amount Paid:</td>
                <td style={{ padding: "8px 0", fontWeight: "bold", color: "#10b981" }}>
                  ${formattedAmount}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#666" }}>Booking ID:</td>
                <td style={{ padding: "8px 0", fontFamily: "monospace", fontSize: "12px" }}>
                  {bookingId}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>What&apos;s Next?</h3>

        {bookingType === "ACCESS" ? (
          <ul style={{ lineHeight: "1.8" }}>
            <li>The mentor will send you access instructions within 24 hours</li>
            <li>You&apos;ll receive credentials for the private community</li>
            <li>Check your dashboard for updates and resources</li>
          </ul>
        ) : (
          <ul style={{ lineHeight: "1.8" }}>
            <li>You&apos;ll receive a calendar invite with the meeting details</li>
            <li>The mentor may reach out with preparation materials</li>
            <li>Join the session at the scheduled time using the meeting link</li>
            <li>Come prepared with questions and topics you&apos;d like to discuss</li>
          </ul>
        )}

        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a
            href={dashboardUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#000",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            View in Dashboard
          </a>
        </div>

        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #3b82f6",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <strong>💡 Need Help?</strong>
          <p style={{ margin: "8px 0 0 0" }}>
            If you have any questions about your booking, reply to this email or contact support.
          </p>
        </div>

        <p style={{ marginTop: "32px", marginBottom: 0 }}>
          Best regards,
          <br />
          The BeMyMentor Team
        </p>
      </div>

      <div
        style={{
          padding: "24px",
          textAlign: "center",
          fontSize: "12px",
          color: "#666",
          backgroundColor: "#f9f9f9",
        }}
      >
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} BeMyMentor. All rights reserved.
        </p>
      </div>
    </div>
  );
}
