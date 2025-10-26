// lib/emails/admin-notification.tsx
import * as React from "react";

interface AdminNotificationEmailProps {
  applicantName: string;
  applicantEmail: string;
  topic: string;
  offerType: string;
  accessPrice?: number;
  hourlyRate?: number;
  proofLinks: string;
  applicationId: string;
  appUrl?: string;
}

export function AdminNotificationEmail({
  applicantName,
  applicantEmail,
  topic,
  offerType,
  accessPrice,
  hourlyRate,
  proofLinks,
  applicationId,
  appUrl = "http://localhost:3000",
}: AdminNotificationEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#000", padding: "24px" }}>
        <h1 style={{ color: "#fff", margin: 0 }}>New Mentor Application</h1>
      </div>
      
      <div style={{ padding: "32px", backgroundColor: "#fff", color: "#000" }}>
        <h2 style={{ marginTop: 0 }}>📝 New Application Received</h2>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tr>
            <td style={{ padding: "8px 0", fontWeight: "bold", width: "140px" }}>Applicant:</td>
            <td style={{ padding: "8px 0" }}>{applicantName}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", fontWeight: "bold" }}>Email:</td>
            <td style={{ padding: "8px 0" }}>{applicantEmail}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", fontWeight: "bold" }}>Topic:</td>
            <td style={{ padding: "8px 0" }}>{topic}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px 0", fontWeight: "bold" }}>Offer Type:</td>
            <td style={{ padding: "8px 0" }}>{offerType}</td>
          </tr>
          {accessPrice && (
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>ACCESS Price:</td>
              <td style={{ padding: "8px 0" }}>${accessPrice}</td>
            </tr>
          )}
          {hourlyRate && (
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Hourly Rate:</td>
              <td style={{ padding: "8px 0" }}>${hourlyRate}/hr</td>
            </tr>
          )}
        </table>
        
        <h3 style={{ marginTop: "32px" }}>Proof Links:</h3>
        <div style={{ 
          backgroundColor: "#f5f5f5", 
          padding: "16px", 
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
          fontSize: "14px"
        }}>
          {proofLinks}
        </div>
        
        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <a
            href={`${appUrl}/admin/applications?highlight=${applicationId}`}
            style={{
              display: "inline-block",
              backgroundColor: "#000",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Review Application
          </a>
        </div>
      </div>
      
      <div style={{ 
        padding: "24px", 
        textAlign: "center", 
        fontSize: "12px", 
        color: "#666",
        backgroundColor: "#f9f9f9"
      }}>
        <p style={{ margin: 0 }}>Application ID: {applicationId}</p>
      </div>
    </div>
  );
}