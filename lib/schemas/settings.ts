// lib/schemas/settings.ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  image: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export const updateNotificationPrefsSchema = z.object({
  emailBookingConfirmation: z.boolean().default(true),
  emailBookingReminder: z.boolean().default(true),
  emailApplicationUpdates: z.boolean().default(true),
  emailMarketingUpdates: z.boolean().default(false),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type NotificationPreferences = z.infer<typeof updateNotificationPrefsSchema>;