// lib/schemas/booking.ts
import { z } from "zod";

export const createBookingSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required"),
  type: z.enum(["ACCESS", "SESSION"]),

  // For SESSION type
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().min(30).max(180).optional(),
  notes: z.string().max(500).optional(),
  isFreeSession: z.boolean().optional(), // Mark if this is a free session
}).refine((data) => {
  // If type is SESSION, scheduledAt and durationMinutes are required
  if (data.type === "SESSION") {
    return data.scheduledAt && data.durationMinutes;
  }
  return true;
}, {
  message: "Session bookings require a scheduled time and duration",
  path: ["scheduledAt"],
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;