"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { isAdmin } from "@/lib/admin";

interface Mentor {
  id: string;
  name: string;
  email: string;
  category: string;
  profileImage: string | null;
  rating: number;
  reviews: number;
  isActive: boolean;
  flagged: boolean;
  flagReason: string | null;
  createdAt: string;
  bookingsCount: number;
  totalEarnings: number;
}

export default function AdminMentorsPage() {
  const { data: session, status } = useSession();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "flagged" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !isAdmin(session.user?.email)) {
      redirect("/");
    }
    fetchMentors();
  }, [session, status]);

  const fetchMentors = async () => {
    try {
      const response = await fetch("/api/admin/mentors");
      const data = await response.json();

      if (!response.ok) {
        console.error("API error:", data);
        return;
      }

      console.log("Fetched mentors:", data.mentors);
      setMentors(data.mentors || []);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async (mentorId: string, reason: string) => {
    try {
      const response = await fetch("/api/admin/mentors/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, reason }),
      });

      if (response.ok) {
        fetchMentors();
      }
    } catch (error) {
      console.error("Error flagging mentor:", error);
    }
  };

  const handleUnflag = async (mentorId: string) => {
    try {
      const response = await fetch("/api/admin/mentors/unflag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId }),
      });

      if (response.ok) {
        fetchMentors();
      }
    } catch (error) {
      console.error("Error unflagging mentor:", error);
    }
  };

  const handleDelete = async (mentorId: string) => {
    if (!confirm("Are you sure you want to permanently delete this mentor? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/mentors/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId }),
      });

      if (response.ok) {
        fetchMentors();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete mentor");
      }
    } catch (error) {
      console.error("Error deleting mentor:", error);
      alert("Failed to delete mentor");
    }
  };

  const handleToggleActive = async (mentorId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/mentors/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, isActive: !isActive }),
      });

      if (response.ok) {
        fetchMentors();
      }
    } catch (error) {
      console.error("Error toggling mentor status:", error);
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    // Apply filter
    if (filter === "active" && !mentor.isActive) return false;
    if (filter === "inactive" && mentor.isActive) return false;
    if (filter === "flagged" && !mentor.flagged) return false;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        mentor.name.toLowerCase().includes(query) ||
        mentor.email.toLowerCase().includes(query) ||
        mentor.category.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-white/60">Loading mentors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Mentor Management</h1>
          <p className="text-white/60">{filteredMentors.length} mentors</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "all"
                  ? "bg-primary-500 text-white"
                  : "bg-dark-800 text-white/60 hover:bg-dark-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "active"
                  ? "bg-primary-500 text-white"
                  : "bg-dark-800 text-white/60 hover:bg-dark-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("flagged")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "flagged"
                  ? "bg-red-500 text-white"
                  : "bg-dark-800 text-white/60 hover:bg-dark-700"
              }`}
            >
              Flagged
            </button>
            <button
              onClick={() => setFilter("inactive")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "inactive"
                  ? "bg-primary-500 text-white"
                  : "bg-dark-800 text-white/60 hover:bg-dark-700"
              }`}
            >
              Inactive
            </button>
          </div>

          <input
            type="text"
            placeholder="Search mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Mentors List */}
        <div className="space-y-4">
          {filteredMentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onFlag={handleFlag}
              onUnflag={handleUnflag}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}

          {filteredMentors.length === 0 && (
            <div className="bg-dark-900 rounded-xl p-12 text-center">
              <p className="text-white/60">No mentors found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MentorCard({
  mentor,
  onFlag,
  onUnflag,
  onDelete,
  onToggleActive,
}: {
  mentor: Mentor;
  onFlag: (id: string, reason: string) => void;
  onUnflag: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}) {
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  const handleFlagSubmit = () => {
    if (!flagReason.trim()) {
      alert("Please provide a reason for flagging this mentor");
      return;
    }
    onFlag(mentor.id, flagReason);
    setShowFlagDialog(false);
    setFlagReason("");
  };

  return (
    <div
      className={`bg-dark-900 rounded-xl p-6 border ${
        mentor.flagged
          ? "border-red-500/50"
          : mentor.isActive
          ? "border-white/10"
          : "border-amber-500/50"
      }`}
    >
      <div className="flex gap-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {mentor.profileImage ? (
            <Image
              src={mentor.profileImage}
              alt={mentor.name}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-dark-800 rounded-lg flex items-center justify-center text-white/40 text-2xl font-bold">
              {mentor.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Mentor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">{mentor.name}</h3>
              <p className="text-white/60 text-sm">{mentor.email}</p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {mentor.flagged && (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
                  FLAGGED
                </span>
              )}
              {!mentor.isActive && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
                  INACTIVE
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Category</p>
              <p className="text-white text-sm font-medium">{mentor.category}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Rating</p>
              <p className="text-white text-sm font-medium">
                ⭐ {mentor.rating.toFixed(1)} ({mentor.reviews} reviews)
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Bookings</p>
              <p className="text-white text-sm font-medium">{mentor.bookingsCount}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Total Earnings</p>
              <p className="text-white text-sm font-medium">${(mentor.totalEarnings / 100).toFixed(2)}</p>
            </div>
          </div>

          {mentor.flagged && mentor.flagReason && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs font-medium text-red-400 mb-1">Flag Reason:</p>
              <p className="text-sm text-white/80">{mentor.flagReason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {!mentor.flagged ? (
              <button
                onClick={() => setShowFlagDialog(true)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition border border-red-500/30"
              >
                Flag Mentor
              </button>
            ) : (
              <button
                onClick={() => onUnflag(mentor.id)}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition border border-green-500/30"
              >
                Unflag Mentor
              </button>
            )}

            <button
              onClick={() => onToggleActive(mentor.id, mentor.isActive)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                mentor.isActive
                  ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/30"
                  : "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              }`}
            >
              {mentor.isActive ? "Deactivate" : "Activate"}
            </button>

            <a
              href={`/mentor/${mentor.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg text-sm font-medium transition border border-white/10"
            >
              View Profile
            </a>

            <button
              onClick={() => onDelete(mentor.id)}
              className="px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-300 rounded-lg text-sm font-medium transition border border-red-900/30"
            >
              Delete Mentor
            </button>
          </div>
        </div>
      </div>

      {/* Flag Dialog */}
      {showFlagDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Flag Mentor</h3>
            <p className="text-white/60 text-sm mb-4">
              Please provide a reason for flagging {mentor.name}. This will help track suspicious activity.
            </p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g., Reported for scamming, multiple refund requests, inappropriate behavior..."
              className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFlagDialog(false);
                  setFlagReason("");
                }}
                className="flex-1 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagSubmit}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
              >
                Flag Mentor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
