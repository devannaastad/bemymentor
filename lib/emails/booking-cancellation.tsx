// lib/emails/booking-cancellation.tsx
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

interface BookingCancellationEmailProps {
  recipientName: string;
  bookingId: string;
  mentorName: string;
  sessionDate?: string;
  sessionTime?: string;
  cancellationReason: string;
  refundAmount?: number;
  isMentor: boolean; // true if recipient is the mentor, false if student
}

export default function BookingCancellationEmail({
  recipientName = "User",
  bookingId = "BOOKING123",
  mentorName = "Mentor Name",
  sessionDate = "October 30, 2025",
  sessionTime = "2:00 PM",
  cancellationReason = "Scheduling conflict",
  refundAmount = 0,
  isMentor = false,
}: BookingCancellationEmailProps) {
  const previewText = isMentor
    ? `A student has cancelled their booking`
    : `Your booking has been cancelled`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Cancelled</Heading>

          <Text style={text}>Hi {recipientName},</Text>

          <Text style={text}>
            {isMentor ? (
              <>
                A student has cancelled their booking with you.
              </>
            ) : (
              <>
                Your booking has been successfully cancelled.
              </>
            )}
          </Text>

          <Section style={codeBox}>
            <Text style={confirmationCodeText}>Booking #{bookingId}</Text>
          </Section>

          <Section style={infoSection}>
            <Text style={infoText}>
              <strong>Mentor:</strong> {mentorName}
            </Text>
            {sessionDate && sessionTime && (
              <Text style={infoText}>
                <strong>Session Date:</strong> {sessionDate} at {sessionTime}
              </Text>
            )}
            <Text style={infoText}>
              <strong>Reason:</strong> {cancellationReason}
            </Text>
          </Section>

          {!isMentor && refundAmount > 0 && (
            <Section style={refundSection}>
              <Text style={refundText}>
                💰 <strong>Refund Amount:</strong> ${refundAmount.toFixed(2)}
              </Text>
              <Text style={smallText}>
                Your refund has been processed and will appear in your account within 5-10 business days.
              </Text>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>
              View Dashboard
            </Button>
          </Section>

          <Text style={footer}>
            Questions? Reply to this email or contact us at{" "}
            <Link href="mailto:support@bemymentor.dev" style={link}>
              support@bemymentor.dev
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
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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

const refundSection = {
  margin: "24px",
  padding: "20px",
  backgroundColor: "#d4edda",
  borderRadius: "8px",
  border: "1px solid #c3e6cb",
};

const refundText = {
  margin: "0 0 8px 0",
  fontSize: "16px",
  color: "#155724",
};

const smallText = {
  margin: "0",
  fontSize: "13px",
  color: "#155724",
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
