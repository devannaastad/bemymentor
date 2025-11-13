// lib/content-moderation.ts

/**
 * List of inappropriate words/phrases to filter
 * This is a basic implementation - for production, consider using a more comprehensive
 * word list or an API service like Perspective API or Azure Content Moderator
 */
const INAPPROPRIATE_WORDS = [
  // Profanity
  "fuck", "shit", "bitch", "ass", "damn", "hell", "crap", "piss",
  "dick", "cock", "pussy", "cunt", "bastard", "whore", "slut",

  // Racial slurs (censored versions for detection)
  "n*gger", "n*gga", "ch*nk", "sp*c", "k*ke", "f*g", "f*ggot",

  // Sexual content
  "porn", "xxx", "sex", "nude", "naked", "penis", "vagina", "boobs", "tits",

  // Threats/Violence
  "kill", "murder", "rape", "assault", "abuse", "attack",

  // Scam-related
  "venmo", "cashapp", "paypal", "zelle", "bitcoin", "crypto wallet",
  "wire transfer", "send money", "gift card", "bank account",

  // Contact info sharing (to prevent off-platform communication)
  "whatsapp", "telegram", "discord", "snapchat", "kik",
];

/**
 * Patterns to detect phone numbers, emails, URLs
 */
const PATTERNS = {
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  url: /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi,
  socialHandle: /@[a-zA-Z0-9_]+/g,
};

/**
 * Check if content contains inappropriate words or patterns
 */
export function containsInappropriateContent(content: string): {
  isInappropriate: boolean;
  reason?: string;
} {
  const normalizedContent = content.toLowerCase().trim();

  // Check for inappropriate words
  for (const word of INAPPROPRIATE_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/\*/g, ".")}\\b`, "i");
    if (regex.test(normalizedContent)) {
      return {
        isInappropriate: true,
        reason: "Message contains inappropriate language",
      };
    }
  }

  // Check for phone numbers
  if (PATTERNS.phone.test(content)) {
    return {
      isInappropriate: true,
      reason: "Phone numbers are not allowed. Please use the platform's messaging system.",
    };
  }

  // Check for email addresses
  if (PATTERNS.email.test(content)) {
    return {
      isInappropriate: true,
      reason: "Email addresses are not allowed. Please use the platform's messaging system.",
    };
  }

  // Check for URLs
  if (PATTERNS.url.test(content)) {
    return {
      isInappropriate: true,
      reason: "External links are not allowed for safety reasons.",
    };
  }

  return { isInappropriate: false };
}

/**
 * Sanitize content by removing or masking inappropriate parts
 */
export function sanitizeContent(content: string): string {
  let sanitized = content;

  // Remove URLs
  sanitized = sanitized.replace(PATTERNS.url, "[link removed]");

  // Remove emails
  sanitized = sanitized.replace(PATTERNS.email, "[email removed]");

  // Remove phone numbers
  sanitized = sanitized.replace(PATTERNS.phone, "[phone removed]");

  // Remove social media handles
  sanitized = sanitized.replace(PATTERNS.socialHandle, "[handle removed]");

  return sanitized;
}
