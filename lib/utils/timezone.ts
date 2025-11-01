// lib/utils/timezone.ts

/**
 * Get the user's current timezone using Intl API
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error("Error getting user timezone:", error);
    return "America/New_York"; // Fallback
  }
}

/**
 * Convert a time string from one timezone to another
 * @param time - Time in format "HH:MM" (24-hour)
 * @param date - The date for the time
 * @param fromTimezone - Source timezone
 * @param toTimezone - Target timezone
 * @returns Time in target timezone in "HH:MM" format
 */
export function convertTime(
  time: string,
  date: Date,
  fromTimezone: string,
  toTimezone: string
): string {
  // Split time string for parsing
  time.split(":").map(Number);

  // Create a date object in the source timezone
  const dateTimeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${time}:00`;

  // Parse as if it's in the source timezone
  const sourceDate = new Date(dateTimeStr + getTimezoneOffset(fromTimezone));

  // Format in target timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: toTimezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(sourceDate).replace(/:/g, ":");
}

/**
 * Get timezone offset string for a timezone (e.g., "-05:00")
 */
function getTimezoneOffset(timezone: string): string {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  const offset = (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  const sign = offset <= 0 ? "+" : "-";
  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Format time for display (12-hour format)
 */
export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Get timezone abbreviation (e.g., "PST", "EST")
 */
export function getTimezoneAbbreviation(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find((part) => part.type === "timeZoneName");
    return timeZonePart?.value || timezone;
  } catch {
    return timezone;
  }
}

/**
 * Common timezones for selector
 */
export const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
];
