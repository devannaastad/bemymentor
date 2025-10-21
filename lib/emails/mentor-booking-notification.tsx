// lib/emails/mentor-booking-notification.tsx
import * as React from "react";

interface MentorBookingNotificationEmailProps {
  mentorName: string;
  userName: string;
  userEmail: string;
  bookingType: "ACCESS" | "SESSION";
  totalAmount: number; // in cents
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  notes?: string | null;
  bookingId: string;
  dashboardUrl: string;
}

export function MentorBookingNotificationEmail({
  mentorName,
  userName,
  userEmail,
  bookingType,
  totalAmount,
  scheduledAt,
  durationMinutes,
  notes,
  bookingId,
  dashboardUrl,
}: MentorBookingNotificationEmailProps) {
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
          🎉
        </div>

        <h2 style={{ marginTop: 0, textAlign: "center" }}>New Booking Received!</h2>

        <p>Hi {mentorName},</p>

        <p>
          Congratulations! You have a new confirmed booking. The payment has been processed
          successfully.
        </p>

        <div
          style={{
            backgroundColor: "#fef3c7",
            border: "2px solid #f59e0b",
            padding: "20px",
            borderRadius: "8px",
            margin: "24px 0",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#92400e" }}>Booking Details</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", color: "#666" }}>Student:</td>
                <td style={{ padding: "8px 0", fontWeight: "bold" }}>{userName}</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#666" }}>Email:</td>
                <td style={{ padding: "8px 0" }}>{userEmail}</td>
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
                <td style={{ padding: "8px 0", color: "#666" }}>Amount:</td>
                <td style={{ padding: "8px 0", fontWeight: "bold", color: "#10b981" }}>
                  ${formattedAmount}
                </td>
              </tr>
            </tbody>
          </table>

          {notes && (
            <div style={{ marginTop: "16px" }}>
              <strong style={{ color: "#666" }}>Student Notes:</strong>
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "12px",
                  borderRadius: "6px",
                  marginTop: "8px",
                  fontSize: "14px",
                }}
              >
                {notes}
              </div>
            </div>
          )}
        </div>

        <h3>Action Required</h3>

        {bookingType === "ACCESS" ? (
          <ul style={{ lineHeight: "1.8" }}>
            <li>Send access instructions to {userEmail} within 24 hours</li>
            <li>Provide credentials for your private community/resources</li>
            <li>Welcome the new member and set expectations</li>
          </ul>
        ) : (
          <ul style={{ lineHeight: "1.8" }}>
            <li>Add the session to your calendar</li>
            <li>Send a meeting link (Zoom, Google Meet, etc.) to the student</li>
            <li>Review any preparation materials you want to share</li>
            <li>Reach out to confirm the session 24 hours in advance</li>
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
            View in Mentor Dashboard
          </a>
        </div>

        <div
          style={{
            backgroundColor: "#dcfce7",
            border: "1px solid #10b981",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <strong>💰 Payment Processing</strong>
          <p style={{ margin: "8px 0 0 0" }}>
            The payment has been confirmed. Your payout will be processed according to your Stripe
            Connect settings (minus platform fees).
          </p>
        </div>

        <p style={{ marginTop: "32px", marginBottom: 0 }}>
          Best of luck with your session!
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
