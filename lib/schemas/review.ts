// lib/schemas/review.ts
import { z } from "zod";

// Schema for creating reviews - supports SESSION, CONTENT_PASS, and SUBSCRIPTION types
export const createReviewSchema = z.object({
  type: z.enum(["SESSION", "CONTENT_PASS", "SUBSCRIPTION"], {
    message: "Review type is required",
  }),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),

  // For SESSION and CONTENT_PASS reviews
  bookingId: z.string().min(1).optional(),

  // For SUBSCRIPTION reviews
  subscriptionId: z.string().min(1).optional(),
}).refine(
  (data) => {
    // SESSION and CONTENT_PASS require bookingId
    if ((data.type === "SESSION" || data.type === "CONTENT_PASS") && !data.bookingId) {
      return false;
    }
    // SUBSCRIPTION requires subscriptionId
    if (data.type === "SUBSCRIPTION" && !data.subscriptionId) {
      return false;
    }
    return true;
  },
  {
    message: "bookingId required for SESSION/CONTENT_PASS reviews, subscriptionId required for SUBSCRIPTION reviews",
  }
);

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
