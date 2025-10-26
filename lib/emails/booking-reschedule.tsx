// lib/emails/booking-reschedule.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface BookingRescheduleEmailProps {
  recipientName: string;
  bookingId: string;
  mentorName: string;
  oldDate?: string;
  oldTime?: string;
  newDate: string;
  newTime: string;
  reason?: string;
  isMentor: boolean; // true if recipient is the mentor, false if student
  initiatedByMentor: boolean; // true if mentor initiated the reschedule
}

export default function BookingRescheduleEmail({
  recipientName = "User",
  bookingId = "BOOKING123",
  mentorName = "Mentor Name",
  oldDate = "October 30, 2025",
  oldTime = "2:00 PM",
  newDate = "November 5, 2025",
  newTime = "3:00 PM",
  reason,
  isMentor = false,
  initiatedByMentor = false,
}: BookingRescheduleEmailProps) {
  const previewText = isMentor
    ? initiatedByMentor
      ? `You rescheduled a session`
      : `A student has rescheduled their session`
    : initiatedByMentor
    ? `Your mentor has rescheduled your session`
    : `Your session has been rescheduled`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Session Rescheduled</Heading>

          <Text style={text}>Hi {recipientName},</Text>

          <Text style={text}>
            {isMentor ? (
              initiatedByMentor ? (
                <>You have rescheduled a session.</>
              ) : (
                <>A student has requested to reschedule their session with you.</>
              )
            ) : initiatedByMentor ? (
              <>Your mentor has rescheduled your upcoming session.</>
            ) : (
              <>Your session has been successfully rescheduled.</>
            )}
          </Text>

          <Section style={codeBox}>
            <Text style={confirmationCodeText}>Booking #{bookingId}</Text>
          </Section>

          <Section style={infoSection}>
            <Text style={infoText}>
              <strong>Mentor:</strong> {mentorName}
            </Text>
            {oldDate && oldTime && (
              <Text style={oldDateText}>
                <strong>Previous Date:</strong> {oldDate} at {oldTime}
              </Text>
            )}
            <Text style={newDateText}>
              <strong>New Date:</strong> {newDate} at {newTime}
            </Text>
            {reason && (
              <Text style={infoText}>
                <strong>Reason:</strong> {reason}
              </Text>
            )}
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/${
                isMentor ? "mentor-dashboard" : "dashboard"
              }`}
            >
              View Calendar
            </Button>
          </Section>

          <Text style={footer}>
            Questions? Reply to this email or contact us at{" "}
            <Link href="mailto:support@bemymentor.com" style={link}>
              support@bemymentor.com
            </Link>
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} BeMyMentor. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 24px",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 24px",
};

const codeBox = {
  background: "#f4f4f4",
  borderRadius: "4px",
  margin: "24px 24px 32px",
  padding: "12px",
};

const confirmationCodeText = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
  color: "#333",
};

const infoSection = {
  margin: "24px",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  border: "1px solid #e9ecef",
};

const infoText = {
  margin: "8px 0",
  fontSize: "14px",
  color: "#495057",
};

const oldDateText = {
  margin: "8px 0",
  fontSize: "14px",
  color: "#6c757d",
  textDecoration: "line-through",
};

const newDateText = {
  margin: "8px 0",
  fontSize: "14px",
  color: "#7c3aed",
  fontWeight: "600",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 24px",
  textAlign: "center" as const,
  marginTop: "24px",
};

const link = {
  color: "#7c3aed",
  textDecoration: "underline",
};
