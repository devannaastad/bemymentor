// lib/emails/session-reminder.tsx
import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SessionReminderEmailProps {
  recipientName: string;
  mentorName: string;
  studentName: string;
  sessionDate: string;
  sessionTime: string;
  durationMinutes: number;
  meetingLink?: string;
  bookingId: string;
  isMentor: boolean;
  dashboardUrl: string;
}

export default function SessionReminderEmail({
  recipientName,
  mentorName,
  studentName,
  sessionDate,
  sessionTime,
  durationMinutes,
  meetingLink,
  isMentor,
  dashboardUrl,
}: SessionReminderEmailProps) {
  const otherPerson = isMentor ? studentName : mentorName;

  return (
    <Html>
      <Head />
      <Preview>Your session with {otherPerson} starts in 1 hour!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⏰ Session Starting Soon!</Heading>

          <Text style={text}>Hi {recipientName},</Text>

          <Text style={text}>
            This is a friendly reminder that your mentorship session is starting in <strong>1 hour</strong>.
          </Text>

          <Section style={sessionDetails}>
            <Text style={detailTitle}>Session Details:</Text>
            <Text style={detail}>
              <strong>{isMentor ? "Student" : "Mentor"}:</strong> {otherPerson}
            </Text>
            <Text style={detail}>
              <strong>Date:</strong> {sessionDate}
            </Text>
            <Text style={detail}>
              <strong>Time:</strong> {sessionTime}
            </Text>
            <Text style={detail}>
              <strong>Duration:</strong> {durationMinutes} minutes
            </Text>
            <Text style={{ ...detail, fontSize: "13px", color: "#999", marginTop: "8px" }}>
              🌍 Times shown in your local timezone
            </Text>
          </Section>

          {meetingLink && (
            <Section style={meetingSection}>
              <Text style={text}>
                <strong>Meeting Link:</strong>
              </Text>
              <Link href={meetingLink} style={button}>
                Join Meeting
              </Link>
            </Section>
          )}

          <Section style={actionSection}>
            <Link href={dashboardUrl} style={linkButton}>
              View in Dashboard
            </Link>
          </Section>

          <Text style={footer}>
            See you soon!
            <br />
            The BeMyMentor Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 24px",
};

const text = {
  color: "#e0e0e0",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const sessionDetails = {
  backgroundColor: "#1a1a1a",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #333",
};

const detailTitle = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const detail = {
  color: "#e0e0e0",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const meetingSection = {
  margin: "24px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#8b5cf6",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  borderRadius: "8px",
  margin: "12px 0",
};

const actionSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const linkButton = {
  color: "#8b5cf6",
  fontSize: "16px",
  textDecoration: "none",
  fontWeight: "600",
};

const footer = {
  color: "#999",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "32px 0 0",
  textAlign: "center" as const,
};
