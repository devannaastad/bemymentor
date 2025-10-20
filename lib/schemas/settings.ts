// lib/schemas/settings.ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  // Remove image field - we'll add proper image upload later
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;