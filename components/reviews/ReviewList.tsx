import { Star, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  booking: {
    type: string;
    createdAt: Date;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white/5 rounded-lg border border-white/10">
        <Star className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/60">No reviews yet</p>
        <p className="text-white/40 text-sm mt-1">
          Be the first to book and leave a review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name || "User"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white/60 font-medium">
                    {review.user.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>

            {/* Review Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">
                      {review.user.name || "Anonymous"}
                    </h4>
                    {review.isVerifiedPurchase && (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Star Rating */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-white/80 text-sm leading-relaxed mt-3">
                  {review.comment}
                </p>
              )}

              {/* Booking Type Badge */}
              <div className="mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/60">
                  {review.booking.type === "SESSION" ? "Session" : "Access"} booking
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
