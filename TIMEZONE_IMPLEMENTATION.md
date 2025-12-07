# Timezone Implementation Guide

## Overview

BeMyMentor implements a comprehensive timezone handling system following industry best practices. This ensures that users across different timezones can schedule sessions accurately and receive notifications at the correct local times.

## The Three Layers of Time

### 1. **Storage Layer: Everything in UTC**

**Rule:** All timestamps are stored in UTC in the PostgreSQL database.

**Why?**
- UTC never changes (no daylight savings complications)
- Provides a single source of truth
- Makes calculations and comparisons reliable
- Backend logic remains timezone-agnostic

**Implementation:**
- Prisma `DateTime` fields automatically store in UTC with PostgreSQL
- When creating bookings, datetimes are converted to UTC before saving
- Example: A session scheduled for 3:00 PM PST becomes `2025-12-10T23:00:00.000Z` in the database

**Database Fields Using UTC:**
```typescript
// Booking model
scheduledAt: DateTime?                  // Session start time (UTC)
reminder24hSentAt: DateTime?           // When 24h reminder was sent (UTC)
reminder1hSentAt: DateTime?            // When 1h reminder was sent (UTC)
reminder15minSentAt: DateTime?         // When 15min reminder was sent (UTC)
completionReminderSentAt: DateTime?    // When completion reminder was sent (UTC)

// AvailableSlot model
startTime: DateTime                    // Slot start (UTC)
endTime: DateTime                      // Slot end (UTC)

// BlockedSlot model
startTime: DateTime                    // Blocked period start (UTC)
endTime: DateTime                      // Blocked period end (UTC)
```

### 2. **Detection Layer: User's Timezone**

**Rule:** Detect the user's timezone automatically via the browser.

**Implementation:**
```typescript
// lib/utils/timezone.ts
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Returns: "America/Denver", "Europe/London", "Asia/Tokyo", etc.
}
```

**Where Used:**
- Automatically detected in all frontend components
- Stored in User model: `timezone: String @default("America/New_York")`
- Stored in Mentor model: `timezone: String @default("America/New_York")`
- Users can override via Settings page

**When to Ask Manually:**
- Scheduling on behalf of someone else (rare)
- User wants to override detected timezone

### 3. **Display Layer: Convert UTC → User's Timezone**

**Rule:** Always convert UTC timestamps to the user's local timezone before displaying.

**Implementation:**
```typescript
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

// Convert UTC to user's timezone
const userTimezone = "America/Los_Angeles";
const localTime = toZonedTime(utcTimestamp, userTimezone);
const formatted = format(localTime, "h:mm a"); // "3:00 PM"
```

**Timezone Utilities:**
```typescript
// lib/utils/timezone.ts

getUserTimezone()              // Detect browser timezone
getTimezoneAbbreviation(tz)   // "PST", "EST", "GMT", etc.
formatTimeWithTimezone(date, tz)  // "3:00 PM PST"
formatDateWithTimezone(date, tz)  // "Dec 10, 2025 3:00 PM PST"
```

## How Scheduling Works Between Two Users

**Scenario:** Mentor in New York (EST) and Student in Los Angeles (PST)

### Step 1: Mentor Sets Availability
```typescript
// Mentor creates available slot for 3:00 PM EST
// Frontend: User selects 3:00 PM in their local timezone (EST)
// Backend: Converts to UTC and stores
// Database: 2025-12-10T20:00:00.000Z (UTC)
```

### Step 2: Student Views Available Times
```typescript
// API returns slots in UTC
// Frontend converts UTC → Student's timezone (PST)
// Student sees: 12:00 PM PST
// When clicked, sends UTC datetime to backend
```

### Step 3: Booking Confirmation
```typescript
// Database stores: 2025-12-10T20:00:00.000Z (UTC)
// Student email: "Session at 12:00 PM PST"
// Mentor email: "Session at 3:00 PM EST"
```

### Step 4: Reminders
```typescript
// Cron job finds sessions starting in 1 hour (UTC comparison)
// Converts to each user's timezone for notifications
// Student: "Session in 1 hour at 12:00 PM PST"
// Mentor: "Session in 1 hour at 3:00 PM EST"
```

## File-by-File Implementation

### Frontend Components

#### `components/booking/TimeSlotSelector.tsx`
**Purpose:** Shows available time slots to the user

**Timezone Flow:**
1. Fetches slots from API (times in mentor's timezone)
2. Receives mentor's timezone from API response
3. Converts each slot from mentor TZ → user TZ for display
4. Stores both `originalTime` (mentor TZ) and `displayTime` (user TZ)
5. Constructs UTC datetime using `fromZonedTime()`
6. Passes UTC datetime to parent when clicked

**Key Code:**
```typescript
// Convert mentor's time to UTC
const mentorDateTime = new Date(selectedDate);
mentorDateTime.setHours(hours, minutes, 0, 0);
const utcDatetime = fromZonedTime(mentorDateTime, mentorTz);

// Display in user's timezone
const displayTime = formatInTimeZone(utcDatetime, userTz, "HH:mm");
```

#### `components/booking/SessionScheduler.tsx`
**Purpose:** Session scheduling interface

**Timezone Flow:**
1. Receives UTC datetime from TimeSlotSelector
2. Displays time in user's timezone with abbreviation
3. Passes UTC datetime to BookingForm

**Display:**
```typescript
<span className="text-primary-300 ml-1">
  {getTimezoneAbbreviation(getUserTimezone())}
</span>
```

#### `components/booking/BookingForm.tsx`
**Purpose:** Creates booking via API

**Timezone Flow:**
1. Receives UTC datetime from SessionScheduler
2. Converts to ISO string for API: `scheduledAt.toISOString()`
3. Sends to backend: `"2025-12-10T23:00:00.000Z"`

### Backend APIs

#### `app/api/bookings/route.ts`
**Purpose:** Create new bookings

**Timezone Flow:**
```typescript
// Frontend sends: "2025-12-10T23:00:00.000Z" (ISO string)
scheduledAt: scheduledAt ? new Date(scheduledAt) : null
// Prisma stores in PostgreSQL as UTC
```

#### `app/api/mentors/[id]/available-slots/route.ts`
**Purpose:** Get available time slots for a mentor

**Timezone Flow:**
1. Receives date in YYYY-MM-DD format
2. Queries AvailableSlot records (stored in UTC)
3. Formats times in mentor's timezone for response
4. Returns `{ slots: [...], timezone: mentorTimezone }`

**Key Code:**
```typescript
const timeInMentorTz = currentSlotStart.toLocaleTimeString("en-US", {
  timeZone: mentorTimezone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}); // Returns "15:00" in mentor's TZ
```

### Cron Jobs (Reminders)

#### `app/api/cron/session-reminders-24h/route.ts`
**Purpose:** Send reminders 24 hours before session

**Timezone Flow:**
```typescript
// 1. Find sessions in UTC window (23-25 hours from now)
scheduledAt: { gte: addHours(now, 23), lte: addHours(now, 25) }

// 2. Convert to each user's timezone
const studentTimezone = booking.user.timezone || "America/New_York";
const mentorTimezone = booking.mentor.timezone || "America/New_York";

const studentSessionTime = toZonedTime(booking.scheduledAt!, studentTimezone);
const mentorSessionTime = toZonedTime(booking.scheduledAt!, mentorTimezone);

// 3. Format for display
const studentTimeStr = format(studentSessionTime, "h:mm a"); // "3:00 PM"
const mentorTimeStr = format(mentorSessionTime, "h:mm a");   // "6:00 PM"

// 4. Send personalized emails and notifications
```

**Other Reminder Jobs:**
- `session-reminders/route.ts` (1 hour) - ✅ Uses timezone conversion
- `session-reminders-15min/route.ts` (15 min) - ✅ Uses timezone conversion
- `completion-reminders/route.ts` (after session) - ✅ Uses timezone conversion

### Timezone Utilities

#### `lib/utils/timezone.ts`
**Available Functions:**

```typescript
// Detection
getUserTimezone(): string
// Returns IANA timezone (e.g., "America/Denver")

// Abbreviations
getTimezoneAbbreviation(timezone: string): string
// Returns short form (e.g., "PST", "EST", "GMT")

// Formatting
formatTimeDisplay(time: string): string
// "09:00" → "9:00 AM"

formatTimeWithTimezone(date: Date, timezone: string): string
// "3:00 PM PST"

formatDateWithTimezone(date: Date, timezone: string): string
// "Dec 10, 2025 3:00 PM PST"

formatDateOnly(date: Date, timezone: string): string
// "December 10, 2025"

// Conversion
convertTime(time: string, date: Date, fromTimezone: string, toTimezone: string): string
// Converts "15:00" from EST to PST → "12:00"
```

**Supported Timezones:**
- **US:** Eastern, Central, Mountain, Pacific, Alaska, Hawaii
- **Europe:** London, Paris, Berlin, Madrid, Rome, Amsterdam, Brussels, Vienna, Warsaw, Athens, Moscow
- **Asia:** Dubai, India, Singapore, Hong Kong, China, Japan, Korea
- **Australia:** Sydney, Melbourne, Brisbane, Perth
- **Other:** Auckland, São Paulo, Mexico City, Toronto, Vancouver

## Common Pitfalls & Solutions

### ❌ Mistake 1: Storing Local Time in Database
```typescript
// WRONG
const localTime = new Date("2025-12-10 15:00"); // Ambiguous!
await db.booking.create({ scheduledAt: localTime });
```

**Why It's Wrong:**
- Daylight saving changes → everything shifts by an hour
- Can't tell which timezone this is in
- Breaks when users are in different timezones

**✅ Solution:**
```typescript
// CORRECT
const localDateTime = new Date(selectedDate);
localDateTime.setHours(hours, minutes, 0, 0);
const utcDateTime = fromZonedTime(localDateTime, mentorTimezone);
await db.booking.create({ scheduledAt: utcDateTime });
```

### ❌ Mistake 2: Hardcoding Timezone Offsets
```typescript
// WRONG
const offset = -7; // PST is UTC-7, right?
// Breaks during daylight saving! (PST becomes PDT = UTC-8)
```

**✅ Solution:**
```typescript
// CORRECT - Use IANA timezone identifiers
const timezone = "America/Los_Angeles";
const localTime = toZonedTime(utcTime, timezone);
// Automatically handles DST transitions
```

### ❌ Mistake 3: Not Converting for Notifications
```typescript
// WRONG - Sends same time to everyone
const sessionTime = format(booking.scheduledAt!, "h:mm a");
await sendEmail({ sessionTime }); // Everyone gets UTC time!
```

**✅ Solution:**
```typescript
// CORRECT - Convert to each user's timezone
const studentTime = toZonedTime(booking.scheduledAt!, studentTimezone);
const mentorTime = toZonedTime(booking.scheduledAt!, mentorTimezone);

await sendEmailToStudent({ sessionTime: format(studentTime, "h:mm a") });
await sendEmailToMentor({ sessionTime: format(mentorTime, "h:mm a") });
```

### ❌ Mistake 4: Using `new Date()` Directly with Time Strings
```typescript
// WRONG
const scheduledAt = new Date(selectedDate);
scheduledAt.setHours(hours, minutes); // Hours are in what timezone?!
```

**✅ Solution:**
```typescript
// CORRECT - Explicitly specify timezone
const localDateTime = new Date(selectedDate);
localDateTime.setHours(hours, minutes, 0, 0);
const utcDateTime = fromZonedTime(localDateTime, knownTimezone);
```

## Testing Timezone Handling

### Manual Testing Checklist

1. **Booking Flow:**
   - [ ] Set browser to different timezone (Chrome DevTools → Sensors → Location)
   - [ ] Book a session and verify time shown matches your timezone
   - [ ] Check database: `scheduledAt` should be in UTC
   - [ ] Verify confirmation email shows correct local time

2. **Reminders:**
   - [ ] Create a booking for 1 hour from now
   - [ ] Wait for reminder email
   - [ ] Verify email shows correct time in your timezone
   - [ ] Check mentor receives email with their timezone

3. **Cross-Timezone:**
   - [ ] Create mentor in EST, student in PST
   - [ ] Book session as student
   - [ ] Verify both see correct local times
   - [ ] Check both receive reminders at correct times

### Automated Testing

```typescript
// Example test for timezone conversion
describe("Timezone Handling", () => {
  it("converts mentor availability to student timezone", () => {
    const mentorTime = "15:00"; // 3 PM EST
    const date = new Date("2025-12-10");

    const mentorTz = "America/New_York";
    const studentTz = "America/Los_Angeles";

    const utcTime = fromZonedTime(
      new Date(date.setHours(15, 0, 0, 0)),
      mentorTz
    );

    const studentTime = formatInTimeZone(utcTime, studentTz, "HH:mm");

    expect(studentTime).toBe("12:00"); // 12 PM PST
  });
});
```

## Daylight Saving Time (DST)

**How We Handle DST:**

IANA timezone identifiers (like `America/New_York`) automatically handle DST transitions:

```typescript
// No special code needed!
const tz = "America/New_York";

// March 10, 2024 (before DST): EST = UTC-5
const winter = toZonedTime(utcDate, tz); // Correct offset

// March 11, 2024 (after DST): EDT = UTC-4
const summer = toZonedTime(utcDate, tz); // Correct offset
```

**Important:**
- Never use numeric offsets (`UTC-5`, `GMT+1`)
- Always use IANA identifiers (`America/New_York`, `Europe/London`)
- Let `date-fns-tz` handle the conversion logic

## Email & Notification Best Practices

### ✅ DO:
- Convert UTC → user's timezone before sending
- Include timezone abbreviation in emails: "3:00 PM PST"
- Send separate emails to student and mentor with their local times
- Store `preferredTimezone` in user profile for emails

### ❌ DON'T:
- Send raw UTC times to users
- Use ambiguous time formats without timezone
- Assume everyone is in the same timezone
- Forget to handle DST transitions

## Migration Guide

If you need to migrate existing timestamps:

```typescript
// If you have local times in DB (bad!)
// Convert to UTC:
import { fromZonedTime } from "date-fns-tz";

const localDateTime = booking.scheduledAt; // Assume this was stored in EST
const utcDateTime = fromZonedTime(localDateTime, "America/New_York");

await db.booking.update({
  where: { id: booking.id },
  data: { scheduledAt: utcDateTime },
});
```

## Recent Fixes (Dec 2025)

### Fixed Issues:

1. **Available Slots API** ([app/api/mentors/[id]/available-slots/route.ts](app/api/mentors/[id]/available-slots/route.ts:53-54))
   - Fixed day boundary calculations to use mentor's timezone
   - Fixed time slot sorting (was alphabetical, now chronological)
   - Times now correctly converted from mentor TZ → UTC for database queries

2. **Booking Reschedule** ([app/api/bookings/[id]/reschedule/route.ts](app/api/bookings/[id]/reschedule/route.ts:122-154))
   - Now formats old/new dates in each user's timezone
   - Student sees times in their timezone
   - Mentor sees times in their timezone

3. **Booking Confirmation Emails** ([lib/emails/booking-confirmation.tsx](lib/emails/booking-confirmation.tsx:9))
   - Changed from `.toLocaleString()` (client-side) to pre-formatted server-side strings
   - Emails now respect user's saved timezone preference
   - Updated in webhook ([app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts:231-241))

4. **Notification Messages** ([lib/notifications.ts](lib/notifications.ts:151))
   - `notifyBookingRescheduled` now accepts pre-formatted date strings
   - No longer uses `.toLocaleDateString()` which was server-locale dependent

5. **Session Scheduler** ([components/booking/SessionScheduler.tsx](components/booking/SessionScheduler.tsx:38-44))
   - Now passes UTC datetime directly to parent
   - Uses `fromZonedTime` to convert from mentor's timezone to UTC
   - Ensures correct time is stored in database

## Summary

✅ **Storage:** All timestamps in UTC (PostgreSQL)
✅ **Detection:** Auto-detect user timezone via `Intl.DateTimeFormat()`
✅ **Display:** Convert UTC → user's timezone using `date-fns-tz`
✅ **Scheduling:** Mentor availability → UTC → Student's local time
✅ **Reminders:** UTC comparison, then convert to each user's timezone
✅ **DST:** Handled automatically with IANA timezone identifiers
✅ **Emails:** Pre-formatted on server with user's timezone preference
✅ **Notifications:** Timezone-aware time display in messages

**Key Libraries:**
- `date-fns` - Date manipulation and formatting
- `date-fns-tz` - Timezone-aware conversions
- `Intl API` - Browser timezone detection

**References:**
- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [date-fns-tz Documentation](https://github.com/marnusw/date-fns-tz)
- [PostgreSQL Timestamp Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
