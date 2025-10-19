// lib/schemas/mentor-setup.ts
import { z } from "zod";

export const mentorSetupSchema = z.object({
  bio: z
    .string()
    .min(50, "Your bio should be at least 50 characters to help learners understand your expertise.")
    .max(2000, "Keep your bio under 2000 characters."),
  profileImage: z
    .string()
    .url("Enter a valid image URL.")
    .optional()
    .or(z.literal("")),
  twitterUrl: z
    .string()
    .url("Enter a valid URL.")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Enter a valid URL.")
    .optional()
    .or(z.literal("")),
  websiteUrl: z
    .string()
    .url("Enter a valid URL.")
    .optional()
    .or(z.literal("")),
});

export type MentorSetupFormValues = z.infer<typeof mentorSetupSchema>;