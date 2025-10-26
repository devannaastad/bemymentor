// lib/utils/error-messages.ts

/**
 * User-friendly error messages for common error scenarios
 */
export const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: "Please sign in to continue",
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",

  // Authorization
  FORBIDDEN: "You don't have permission to access this resource",
  NOT_MENTOR: "You need to be a mentor to access this feature",
  NOT_OWNER: "You can only modify your own content",

  // Validation
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_URL: "Please enter a valid URL",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  PASSWORDS_DONT_MATCH: "Passwords don't match",
  INVALID_PRICE: "Price must be a positive number",
  INVALID_DATE: "Please select a valid date",
  INVALID_TIME: "Please select a valid time",
  DATE_IN_PAST: "Please select a future date",
  INVALID_DURATION: "Session duration must be between 15 and 240 minutes",

  // Booking
  SLOT_NOT_AVAILABLE: "This time slot is no longer available. Please choose another time.",
  BOOKING_NOT_FOUND: "Booking not found. It may have been cancelled or deleted.",
  ALREADY_BOOKED: "You already have a booking with this mentor at this time",
  CANNOT_BOOK_OWN_SESSIONS: "You cannot book a session with yourself",
  CANNOT_CANCEL_COMPLETED: "Completed bookings cannot be cancelled",
  CANCELLATION_REASON_TOO_SHORT: "Please provide a detailed reason for cancellation (at least 10 characters)",

  // Payment
  PAYMENT_FAILED: "Payment failed. Please check your card details and try again.",
  STRIPE_NOT_CONNECTED: "Payment setup incomplete. Please connect your Stripe account first.",
  REFUND_FAILED: "Refund could not be processed. Please contact support.",
  INSUFFICIENT_FUNDS: "Insufficient funds for this transaction",

  // Profile
  PROFILE_NOT_FOUND: "Profile not found",
  MENTOR_NOT_FOUND: "Mentor not found or may have deactivated their profile",
  INCOMPLETE_PROFILE: "Please complete your profile before proceeding",
  PROFILE_IMAGE_TOO_LARGE: "Profile image must be less than 5MB",
  INVALID_IMAGE_FORMAT: "Image must be in JPG, PNG, or WebP format",

  // Availability
  INVALID_TIME_RANGE: "End time must be after start time",
  OVERLAPPING_AVAILABILITY: "This time slot overlaps with existing availability",
  NO_AVAILABILITY: "No availability set for this date",

  // General
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  NOT_FOUND: "The requested resource was not found",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  FILE_TOO_LARGE: "File is too large. Maximum size is 10MB.",

  // Form Validation
  FORM_INVALID: "Please fix the errors in the form before submitting",
  FORM_SUBMISSION_FAILED: "Form submission failed. Please try again.",
};

/**
 * Convert technical error messages to user-friendly ones
 */
export function getUserFriendlyError(error: unknown): string {
  // If it's already a string, check if it's a known error
  if (typeof error === "string") {
    // Check for common technical errors
    if (error.toLowerCase().includes("unauthorized")) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    if (error.toLowerCase().includes("forbidden")) {
      return ERROR_MESSAGES.FORBIDDEN;
    }
    if (error.toLowerCase().includes("not found")) {
      return ERROR_MESSAGES.NOT_FOUND;
    }
    if (error.toLowerCase().includes("network")) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    // Return the error as-is if it's already user-friendly
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("fetch")) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    // Return the error message if it seems user-friendly
    if (error.message && !error.message.includes("Error:")) {
      return error.message;
    }
  }

  // Default fallback
  return ERROR_MESSAGES.SERVER_ERROR;
}

/**
 * Format Zod validation errors into user-friendly messages
 */
export function formatZodErrors(errors: Record<string, string[] | undefined>): string[] {
  const messages: string[] = [];

  for (const [field, fieldErrors] of Object.entries(errors)) {
    if (fieldErrors && fieldErrors.length > 0) {
      // Capitalize field name
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');

      // Use the first error for each field
      const errorMsg = fieldErrors[0];

      // Make common validation errors more user-friendly
      if (errorMsg.includes("Required")) {
        messages.push(ERROR_MESSAGES.REQUIRED_FIELD(fieldName));
      } else if (errorMsg.includes("email")) {
        messages.push(ERROR_MESSAGES.INVALID_EMAIL);
      } else if (errorMsg.includes("url") || errorMsg.includes("URL")) {
        messages.push(ERROR_MESSAGES.INVALID_URL);
      } else {
        messages.push(`${fieldName}: ${errorMsg}`);
      }
    }
  }

  return messages;
}

/**
 * Get an appropriate error message for HTTP status codes
 */
export function getErrorForStatusCode(status: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.FORM_INVALID;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 429:
      return ERROR_MESSAGES.RATE_LIMITED;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.SERVER_ERROR;
  }
}
