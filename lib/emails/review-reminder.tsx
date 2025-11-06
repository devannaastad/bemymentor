// lib/emails/review-reminder.tsx
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

interface ReviewReminderEmailProps {
  studentName: string;
  mentorName: string;
  sessionDate: string;
  sessionTime: string;
  bookingId: string;
  reviewUrl: string;
}

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#1a1a1a",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  border: "1px solid #2a2a2a",
};

const box = {
  padding: "0 48px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#e0e0e0",
  fontSize: "16px",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#8b5cf6",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 20px",
  margin: "24px 0",
};

const hr = {
  borderColor: "#2a2a2a",
  margin: "26px 0",
};

const footer = {
  color: "#8a8a8a",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "32px",
};

export default function ReviewReminderEmail({
  studentName,
  mentorName,
  sessionDate,
  sessionTime,
  reviewUrl,
}: ReviewReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>How was your session with {mentorName}?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={h1}>⭐ How was your session?</Heading>

            <Text style={text}>Hi {studentName},</Text>

            <Text style={text}>
              We hope you had a great mentorship session with <strong>{mentorName}</strong> on{" "}
              {sessionDate} at {sessionTime}!
            </Text>

            <Text style={text}>
              Your feedback helps other learners find great mentors and helps mentors improve their
              services. Would you mind taking a moment to share your experience?
            </Text>

            <Link href={reviewUrl} style={button}>
              Write a Review ⭐
            </Link>

            <Text style={text}>Your review will include:</Text>

            <Text style={{ ...text, marginLeft: "20px" }}>
              • Star rating (1-5 stars)
              <br />
              • Written feedback (optional)
              <br />• Public display on mentor&apos;s profile
            </Text>

            <hr style={hr} />

            <Text style={footer}>
              This is an automated reminder. If you&apos;ve already left a review, please disregard
              this message.
              <br />
              <br />
              BeMyMentor - Connecting learners with expert mentors
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
