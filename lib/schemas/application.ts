// lib/schemas/application.ts
import { z } from "zod";

/** Server schema: accepts strings and coerces to numbers */
export const applicationSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email address."),
  topic: z.string().min(3, "What do you teach?").max(120),
  proofLinks: z.string().min(10, "Add at least one link (portfolio, results, ranks, etc.)."),
  offerType: z.enum(["ACCESS", "TIME", "BOTH"]),
  price: z.coerce.number().positive("Must be a positive number.").optional(),
  hourlyRate: z.coerce.number().positive("Must be a positive number.").optional(),
});
export type Application = z.output<typeof applicationSchema>;

/** Form schema: all inputs are strings; validate numeric strings for money fields */
export const applicationFormSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email address."),
  topic: z.string().min(3, "What do you teach?").max(120),
  proofLinks: z.string().min(10, "Add at least one link (portfolio, results, ranks, etc.)."),
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
