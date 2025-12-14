// lib/emails/admin-notification.tsx
import * as React from "react";

interface AdminNotificationEmailProps {
  applicantName: string;
  applicantEmail: string;
  phone?: string;
  topic: string;
  customCategory?: string;
  offerType: string;
  accessPrice?: number;
  hourlyRate?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  proofLinks: string;
  proofImages?: string[];
  socialProof?: {
    portfolio?: string;
    youtube?: string;
    twitch?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    other?: string;
  };
  applicationId: string;
  appUrl?: string;
}

export function AdminNotificationEmail({
  applicantName,
  applicantEmail,
  phone,
  topic,
  customCategory,
  offerType,
  accessPrice,
  hourlyRate,
  weeklyPrice,
  monthlyPrice,
  proofLinks,
  proofImages,
  socialProof,
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
          {phone && (
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Phone:</td>
              <td style={{ padding: "8px 0" }}>{phone}</td>
            </tr>
          )}
          <tr>
            <td style={{ padding: "8px 0", fontWeight: "bold" }}>Topic:</td>
            <td style={{ padding: "8px 0" }}>{topic}</td>
          </tr>
          {customCategory && (
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Category:</td>
              <td style={{ padding: "8px 0" }}>{customCategory}</td>
            </tr>
          )}
          <tr>
            <td style={{ padding: "8px 0", fontWeight: "bold" }}>Offer Type:</td>
            <td style={{ padding: "8px 0" }}>{offerType}</td>
          </tr>
          {accessPrice && (
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>ACCESS Price:</td>
              <td style={{ padding: "8px 0" }}>${(accessPrice / 100).toFixed(2)}</td>
            </tr>
          )}
          {hourlyRate && (
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Hourly Rate:</td>
              <td style={{ padding: "8px 0" }}>${(hourlyRate / 100).toFixed(2)}/hr</td>
            </tr>
          )}
          {weeklyPrice && (
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Weekly Subscription:</td>
              <td style={{ padding: "8px 0" }}>${(weeklyPrice / 100).toFixed(2)}/week</td>
            </tr>
          )}
          {monthlyPrice && (
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Monthly Subscription:</td>
              <td style={{ padding: "8px 0" }}>${(monthlyPrice / 100).toFixed(2)}/month</td>
            </tr>
          )}
        </table>

        {socialProof && Object.values(socialProof).some(v => v && v !== "") && (
          <>
            <h3 style={{ marginTop: "32px" }}>Social Proof Links:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
              {socialProof.portfolio && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold", width: "120px" }}>Portfolio:</td>
                  <td style={{ padding: "4px 0" }}>
                    <a href={socialProof.portfolio} style={{ color: "#0066cc" }}>{socialProof.portfolio}</a>
                  </td>
                </tr>
              )}
              {socialProof.youtube && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>YouTube:</td>
                  <td style={{ padding: "4px 0" }}>
                    <a href={socialProof.youtube} style={{ color: "#0066cc" }}>{socialProof.youtube}</a>
                  </td>
                </tr>
              )}
              {socialProof.twitch && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>Twitch:</td>
                  <td style={{ padding: "4px 0" }}>
                    <a href={socialProof.twitch} style={{ color: "#0066cc" }}>{socialProof.twitch}</a>
                  </td>
                </tr>
              )}
              {socialProof.twitter && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>Twitter/X:</td>
                  <td style={{ padding: "4px 0" }}>
                    <a href={socialProof.twitter} style={{ color: "#0066cc" }}>{socialProof.twitter}</a>
                  </td>
                </tr>
              )}
              {socialProof.instagram && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>Instagram:</td>
                  <td style={{ padding: "4px 0" }}>
                    <a href={socialProof.instagram} style={{ color: "#0066cc" }}>{socialProof.instagram}</a>
                  </td>
                </tr>
              )}
              {socialProof.tiktok && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>TikTok:</td>
                  <td style={{ padding: "4px 0" }}>
                    <a href={socialProof.tiktok} style={{ color: "#0066cc" }}>{socialProof.tiktok}</a>
                  </td>
                </tr>
              )}
              {socialProof.other && (
                <tr>
                  <td style={{ padding: "4px 0", fontWeight: "bold" }}>Other:</td>
                  <td style={{ padding: "4px 0" }}>{socialProof.other}</td>
                </tr>
              )}
            </table>
          </>
        )}

        {proofImages && proofImages.length > 0 && (
          <>
            <h3 style={{ marginTop: "24px" }}>Proof Screenshots:</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "16px" }}>
              {proofImages.map((url, index) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Proof ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #e0e0e0"
                    }}
                  />
                </a>
              ))}
            </div>
          </>
        )}

        <h3 style={{ marginTop: "24px" }}>Additional Notes:</h3>
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