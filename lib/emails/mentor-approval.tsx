// lib/emails/mentor-approval.tsx
import React from "react";

interface MentorApprovalEmailProps {
  mentorName: string;
  setupUrl: string;
  discordUrl: string;
}

export default function MentorApprovalEmail({
  mentorName,
  setupUrl,
  discordUrl,
}: MentorApprovalEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#8b5cf6", margin: "0 0 10px 0" }}>Congratulations!</h1>
        <p style={{ fontSize: "18px", color: "#666", margin: "0" }}>Your mentor application has been approved</p>
      </div>

      <div style={{ backgroundColor: "#f9fafb", padding: "25px", borderRadius: "8px", marginBottom: "25px" }}>
        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", margin: "0 0 15px 0" }}>
          Hi {mentorName},
        </p>
        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", margin: "0 0 15px 0" }}>
          Great news! Your application to become a mentor on BeMyMentor has been approved. We&apos;re excited to have you join our community of expert mentors.
        </p>
        <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", margin: "0" }}>
          To get started, please complete your mentor profile setup:
        </p>
      </div>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <a
          href={setupUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#8b5cf6",
            color: "#ffffff",
            padding: "14px 32px",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Complete Mentor Setup
        </a>
      </div>

      <div style={{ backgroundColor: "#dcfce7", border: "2px solid #86efac", padding: "20px", borderRadius: "8px", marginBottom: "25px" }}>
        <h3 style={{ color: "#15803d", margin: "0 0 12px 0", fontSize: "18px" }}>
          Join Our Mentor Community
        </h3>
        <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#166534", margin: "0 0 15px 0" }}>
          Connect with other mentors, get support, share best practices, and stay updated on platform features in our exclusive Discord server!
        </p>
        <div style={{ textAlign: "center" }}>
          <a
            href={discordUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#5865F2",
              color: "#ffffff",
              padding: "12px 28px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            Join Discord Server
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff7ed", padding: "20px", borderRadius: "8px", marginBottom: "25px" }}>
        <h3 style={{ color: "#ea580c", margin: "0 0 12px 0", fontSize: "16px" }}>
          Next Steps:
        </h3>
        <ol style={{ margin: "0", paddingLeft: "20px", color: "#9a3412" }}>
          <li style={{ marginBottom: "8px", lineHeight: "1.5" }}>Complete your mentor profile setup</li>
          <li style={{ marginBottom: "8px", lineHeight: "1.5" }}>Connect your Stripe account to receive payments</li>
          <li style={{ marginBottom: "8px", lineHeight: "1.5" }}>Set your pricing and availability</li>
          <li style={{ marginBottom: "8px", lineHeight: "1.5" }}>Join our Discord community</li>
          <li style={{ marginBottom: "0", lineHeight: "1.5" }}>Start accepting students!</li>
        </ol>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", marginTop: "30px" }}>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px 0" }}>
          Need help? Reply to this email or reach out in Discord.
        </p>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>
          Welcome to the BeMyMentor mentor community!
        </p>
      </div>
    </div>
  );
}
