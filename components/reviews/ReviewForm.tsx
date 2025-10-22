"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import FormFieldError from "@/components/common/FormFieldError";
import { Star } from "lucide-react";

interface ReviewFormProps {
  bookingId: string;
  mentorName: string;
  redirectUrl?: string;
}

export default function ReviewForm({ bookingId, mentorName, redirectUrl = "/dashboard" }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Failed to submit review");
        return;
      }

      // Success - redirect to the specified URL
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      console.error("Review submission error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Rate your experience with {mentorName}
        </h3>
        <p className="text-white/60 text-sm mb-4">
          Your review helps others make informed decisions
        </p>

        {/* Star Rating */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-white/20"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-white/60 self-center">
            {rating} {rating === 1 ? "star" : "stars"}
          </span>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium text-white/80">
            Your review (optional)
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this mentor..."
            rows={4}
            maxLength={1000}
            className="w-full"
          />
          <p className="text-xs text-white/40">
            {comment.length}/1000 characters
          </p>
        </div>
      </div>

      {error && <FormFieldError error={error} />}

      <div className="flex gap-3">
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          Submit Review
        </Button>
      </div>
    </form>
  );
}
