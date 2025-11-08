// lib/schemas/application.ts
import { z } from "zod";

/** Server schema: accepts strings and coerces to numbers, handles empty strings */
export const applicationSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().optional(),
  topic: z.string().min(3, "What do you teach?").max(120),
  proofLinks: z.string().min(10, "Add at least one link (portfolio, results, ranks, etc.)."),
  proofImages: z.array(z.string().url()).optional(),
  socialProof: z.object({
    portfolio: z.union([z.string().url(), z.literal("")]).optional(),
    youtube: z.union([z.string().url(), z.literal("")]).optional(),
    twitch: z.union([z.string().url(), z.literal("")]).optional(),
    twitter: z.union([z.string().url(), z.literal("")]).optional(),
    instagram: z.union([z.string().url(), z.literal("")]).optional(),
    tiktok: z.union([z.string().url(), z.literal("")]).optional(),
    other: z.string().optional(),
  }).optional(),
  offerType: z.enum(["ACCESS", "TIME", "BOTH"]),
  price: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      const num = Number(val);
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val === undefined || val > 0, {
      message: "Must be a positive number.",
    }),
  hourlyRate: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      const num = Number(val);
      if (isNaN(num)) return undefined;
      return num;
    })
    .refine((val) => val === undefined || val > 0, {
      message: "Must be a positive number.",
    }),
});
export type Application = z.output<typeof applicationSchema>;

/** Form schema: all inputs are strings; validate numeric strings for money fields */
export const applicationFormSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().optional(),
  topic: z.string().min(3, "What do you teach?").max(120),
  proofLinks: z.string().min(10, "Add at least one link (portfolio, results, ranks, etc.)."),
  proofImages: z.array(z.string().url()).optional(),
  socialProof: z.object({
    portfolio: z.string().optional(),
    youtube: z.string().optional(),
    twitch: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    other: z.string().optional(),
  }).optional(),
  offerType: z.enum(["ACCESS", "TIME", "BOTH"]),
  price: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === "" || (!Number.isNaN(Number(v)) && Number(v) > 0), {
      message: "Must be a positive number.",
    }),
  hourlyRate: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === "" || (!Number.isNaN(Number(v)) && Number(v) > 0), {
      message: "Must be a positive number.",
    }),
});
export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;