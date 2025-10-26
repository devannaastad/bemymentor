# Error Handling Guide

This document explains the user-friendly error handling system implemented in BeMyMentor.

## Overview

The platform uses a comprehensive error handling system that:
- Converts technical errors into user-friendly messages
- Displays toast notifications for immediate feedback
- Provides inline form validation
- Maintains consistent error messaging across the app

## Components

### 1. Error Messages Utility (`lib/utils/error-messages.ts`)

Contains predefined user-friendly error messages and helper functions.

**Key Functions:**
- `getUserFriendlyError(error)` - Converts any error to a user-friendly string
- `formatZodErrors(errors)` - Formats Zod validation errors
- `getErrorForStatusCode(status)` - Maps HTTP status codes to messages

**Usage Example:**
```typescript
import { getUserFriendlyError, ERROR_MESSAGES } from "@/lib/utils/error-messages";

try {
  // ... some operation
} catch (err) {
  const friendlyError = getUserFriendlyError(err);
  console.error(friendlyError); // User-friendly message
}
```

### 2. Toast Notification System (`components/common/Toast.tsx`)

Visual notification system for displaying messages to users.

**Features:**
- Auto-dismisses after 5 seconds (customizable)
- Color-coded by type (success, error, info, warning)
- Animated slide-in from right
- Close button for manual dismissal
- Icons for each type

**Usage Example:**
```typescript
import { toast } from "@/components/common/Toast";

// Success message
toast.success("Settings saved successfully!");

// Error message
toast.error("Failed to update profile");

// Info message
toast.info("New features available");

// Warning message
toast.warning("Your session will expire soon");

// Custom duration (in milliseconds)
toast.success("Quick message", 2000);
```

### 3. Form Error Handling Pattern

**Best Practice Implementation:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // Client-side validation
  if (!email) {
    const error = ERROR_MESSAGES.REQUIRED_FIELD("Email");
    setError(error);
    toast.error(error);
    setLoading(false);
    return;
  }

  try {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok || !result.ok) {
      const friendlyError = getUserFriendlyError(result.error);
      throw new Error(friendlyError);
    }

    toast.success("Operation completed successfully!");
    // ... handle success
  } catch (err) {
    const friendlyError = getUserFriendlyError(err);
    setError(friendlyError);
    toast.error(friendlyError);
  } finally {
    setLoading(false);
  }
};
```

## Error Message Categories

### Authentication & Authorization
- `UNAUTHORIZED` - User needs to sign in
- `SESSION_EXPIRED` - Session has expired
- `FORBIDDEN` - No permission to access resource

### Validation
- `REQUIRED_FIELD(field)` - Required field is missing
- `INVALID_EMAIL` - Email format is invalid
- `INVALID_PRICE` - Price must be positive
- `INVALID_DATE` - Invalid date selection
- `DATE_IN_PAST` - Date must be in future

### Booking
- `SLOT_NOT_AVAILABLE` - Time slot no longer available
- `BOOKING_NOT_FOUND` - Booking doesn't exist
- `CANNOT_CANCEL_COMPLETED` - Can't cancel completed bookings

### Payment
- `PAYMENT_FAILED` - Payment processing failed
- `STRIPE_NOT_CONNECTED` - Stripe account not connected
- `REFUND_FAILED` - Refund couldn't be processed

### General
- `NETWORK_ERROR` - Connection issue
- `SERVER_ERROR` - Server-side error
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests

## API Error Response Format

APIs should return errors in this format:

```typescript
return NextResponse.json(
  {
    ok: false,
    error: "User-friendly error message"
  },
  { status: 400 }
);
```

## Examples

### Example 1: Mentor Settings Form
See `components/mentor/MentorSettingsForm.tsx` for complete implementation:
- Client-side validation before submission
- User-friendly error conversion
- Toast notifications for feedback
- Inline error display

### Example 2: Adding Toast Container to Layout

Add the `ToastContainer` to your root layout:

```typescript
// app/layout.tsx
import ToastContainer from "@/components/common/Toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
```

## Best Practices

1. **Always use friendly messages** - Never show raw error stack traces to users
2. **Be specific** - Tell users exactly what went wrong and how to fix it
3. **Use toast for actions** - Success/error feedback for form submissions
4. **Use inline errors for validation** - Show field-specific errors near inputs
5. **Provide actions** - Include "Try again" or navigation when helpful
6. **Log technical details** - Use `console.error()` for debugging while showing friendly messages to users

## Testing

Test error scenarios:
- Invalid form inputs
- Network failures
- Server errors (500)
- Authorization failures (401, 403)
- Validation errors (400)

Verify that:
- Users see friendly messages
- Toast notifications appear and dismiss
- Error states clear on retry
- Loading states work correctly
