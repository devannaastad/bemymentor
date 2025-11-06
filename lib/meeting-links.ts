// lib/meeting-links.ts
import { nanoid } from "nanoid";

/**
 * Generate a unique meeting link for a booking
 * Uses Jitsi Meet (free, instant, no account needed)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateMeetingLink(_bookingId: string): string {
  // Generate a short, unique meeting code
  const meetingCode = nanoid(10);

  // Use Jitsi Meet - free video conferencing that works in browser
  // Add config params so first person to join becomes moderator
  // Format: https://meet.jit.si/BeMyMentor-[unique-code]#config.startWithVideoMuted=false
  return `https://meet.jit.si/BeMyMentor-${meetingCode}#config.startWithVideoMuted=false&config.prejoinPageEnabled=false`;
}

/**
 * Generate a Google Meet link
 * Note: This is a placeholder. For production, you'd need to integrate with Google Calendar API
 */
export function generateGoogleMeetLink(bookingId: string): string {
  // Generate unique meeting code
  const meetingCode = nanoid(10).toLowerCase();

  // Google Meet format (this is just a placeholder format)
  return `https://meet.google.com/${meetingCode}-${bookingId.slice(0, 8)}`;
}

/**
 * Generate a Zoom link
 * Note: This is a placeholder. For production, you'd need to integrate with Zoom API
 */
export function generateZoomLink(bookingId: string): string {
  // Generate unique meeting ID based on booking ID for consistency
  const meetingId = Math.floor(100000000 + Math.random() * 900000000);
  const password = nanoid(20);

  // Zoom format (this is just a placeholder format)
  // Include booking ID in the URL for tracking
  return `https://zoom.us/j/${meetingId}?pwd=${password}&booking=${bookingId}`;
}

/**
 * Auto-generate meeting link based on mentor's preferred platform
 */
export function autoGenerateMeetingLink(
  bookingId: string,
  platform: "google" | "zoom" | "generic" = "generic"
): string {
  switch (platform) {
    case "google":
      return generateGoogleMeetLink(bookingId);
    case "zoom":
      return generateZoomLink(bookingId);
    default:
      return generateMeetingLink(bookingId);
  }
}
