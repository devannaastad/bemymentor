"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Booking {
  id: string;
  type: string;
  mentor: {
    name: string;
    profileImage: string | null;
  };
}

export default function SessionCompleteSurvey({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [worthIt, setWorthIt] = useState<boolean | null>(null);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [issuesReported, setIssuesReported] = useState(false);
  const [issues, setIssues] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionType = booking.type === "ACCESS" ? "Access Pass" : "Session";

  const handleSubmit = async () => {
    if (worthIt === null || wouldRecommend === null) {
      alert("Please answer all required questions");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/bookings/${booking.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worthIt,
          wouldRecommend,
          issuesReported,
          issues: issuesReported ? issues : null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Failed to submit");
      }

      // Redirect to review page if they want to leave a review
      router.push(`/bookings/${booking.id}/review?completed=true`);
    } catch (error) {
      console.error("Error submitting:", error);
      alert(error instanceof Error ? error.message : "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-900 rounded-xl p-8 border border-white/10">
      {/* Header */}
      <div className="text-center mb-8">
        {booking.mentor.profileImage && (
          <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white/10">
            <Image
              src={booking.mentor.profileImage}
              alt={booking.mentor.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold text-white mb-2">
          How was your {sessionType.toLowerCase()}?
        </h1>
        <p className="text-white/60">
          Help us build trust in the community by answering a few quick questions about your experience with{" "}
          <span className="text-white font-medium">{booking.mentor.name}</span>
        </p>
      </div>

      {/* Questionnaire */}
      <div className="space-y-6">
        {/* Question 1: Worth it */}
        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
          <label className="block text-lg font-medium text-white mb-4">
            Was this {sessionType.toLowerCase()} worth your time and money? *
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setWorthIt(true)}
              className={`flex-1 py-3 px-6 rounded-lg border-2 transition font-medium ${
                worthIt === true
                  ? "bg-green-500/20 border-green-500 text-green-400"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Yes
              </div>
            </button>
            <button
              onClick={() => setWorthIt(false)}
              className={`flex-1 py-3 px-6 rounded-lg border-2 transition font-medium ${
                worthIt === false
                  ? "bg-red-500/20 border-red-500 text-red-400"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                No
              </div>
            </button>
          </div>
        </div>

        {/* Question 2: Would recommend */}
        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
          <label className="block text-lg font-medium text-white mb-4">
            Would you recommend {booking.mentor.name} to others? *
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setWouldRecommend(true)}
              className={`flex-1 py-3 px-6 rounded-lg border-2 transition font-medium ${
                wouldRecommend === true
                  ? "bg-green-500/20 border-green-500 text-green-400"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                Yes
              </div>
            </button>
            <button
              onClick={() => setWouldRecommend(false)}
              className={`flex-1 py-3 px-6 rounded-lg border-2 transition font-medium ${
                wouldRecommend === false
                  ? "bg-red-500/20 border-red-500 text-red-400"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 113 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                </svg>
                No
              </div>
            </button>
          </div>
        </div>

        {/* Question 3: Any issues */}
        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={issuesReported}
              onChange={(e) => setIssuesReported(e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-white/80">I experienced issues or want to report a problem</span>
          </label>

          {issuesReported && (
            <textarea
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="Please describe the issues you experienced..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || worthIt === null || wouldRecommend === null}
          className="w-full py-4 px-6 bg-primary-500 hover:bg-primary-600 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg transition font-medium text-lg"
        >
          {isSubmitting ? "Submitting..." : "Submit & Continue to Review (Optional)"}
        </button>
        <p className="text-center text-white/40 text-sm mt-3">
          After submitting, you&apos;ll have the option to leave a public review
        </p>
      </div>
    </div>
  );
}
