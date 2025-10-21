// lib/schemas/review.ts
import { z } from "zod";

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
