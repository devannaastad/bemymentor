// lib/emails/application-confirmation.tsx
import * as React from "react";

interface ApplicationConfirmationEmailProps {
  applicantName: string;
  topic: string;
}

export function ApplicationConfirmationEmail({
  applicantName,
  topic,
}: ApplicationConfirmationEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#000", padding: "24px", textAlign: "center" }}>
        <h1 style={{ color: "#fff", margin: 0 }}>BeMyMentor</h1>
      </div>
      
      <div style={{ padding: "32px", backgroundColor: "#fff", color: "#000" }}>
        <h2 style={{ marginTop: 0 }}>Application Received! 🎉</h2>
        
        <p>Hi {applicantName},</p>
        
        <p>
          Thank you for applying to become a mentor on BeMyMentor! We&apos;ve received your application for:
        </p>
        
        <div style={{ 
          backgroundColor: "#f5f5f5", 
          padding: "16px", 
          borderRadius: "8px", 
          margin: "24px 0" 
        }}>
          <strong>{topic}</strong>
        </div>
        
        <h3>What happens next?</h3>
        
        <ol style={{ lineHeight: "1.8" }}>
          <li>Our team will review your application and proof links</li>
          <li>We&apos;ll verify your expertise and check for quality</li>
          <li>You&apos;ll hear back from us within <strong>48 hours</strong></li>
          <li>If approved, we&apos;ll guide you through setting up Stripe payouts</li>
        </ol>
        
        <p style={{ 
          backgroundColor: "#fffbeb", 
          border: "1px solid #fbbf24", 
          padding: "12px", 
          borderRadius: "8px",
          fontSize: "14px"
        }}>
          💡 <strong>Tip:</strong> Make sure to check your spam folder in case our email ends up there!
        </p>
        
        <p>
          If you have any questions, feel free to reply to this email.
        </p>
        
        <p style={{ marginBottom: 0 }}>
          Best regards,<br />
          The BeMyMentor Team
        </p>
      </div>
      
      <div style={{ 
        padding: "24px", 
        textAlign: "center", 
        fontSize: "12px", 
        color: "#666",
        backgroundColor: "#f9f9f9"
      }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} BeMyMentor. All rights reserved.</p>
      </div>
    </div>
  );
}