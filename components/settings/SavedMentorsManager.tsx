// components/settings/SavedMentorsManager.tsx
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import { toast } from "@/components/common/Toast";
import Link from "next/link";

interface SavedMentor {
  id: string;
  name: string;
  tagline: string;
  category: string;
}

export default function SavedMentorsManager({ userId }: { userId: string }) {
  void userId; // keep for future use, silence "unused" warning

  const [mentors, setMentors] = useState<SavedMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadSavedMentors();
  }, []);

  const loadSavedMentors = async () => {
    try {
      const res = await fetch("/api/saved", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");

      const json = await res.json();
      setMentors(json.data || []);
    } catch (err) {
      console.error("[SavedMentorsManager] Load failed:", err);
      toast("Failed to load saved mentors", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (mentorId: string) => {
    if (!confirm("Remove this mentor from your saved list?")) return;

    setRemoving(mentorId);
    try {
      const res = await fetch(`/api/saved/${mentorId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");

      setMentors((prev) => prev.filter((m) => m.id !== mentorId));
      toast("Mentor removed from saved", "success");
    } catch (err) {
      console.error("[SavedMentorsManager] Remove failed:", err);
      toast("Failed to remove mentor", "error");
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
        ))}
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
        <p className="mb-3 text-white/60">You haven&apos;t saved any mentors yet.</p>
        <Button href="/catalog" size="sm">
          Browse Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mentors.map((mentor) => (
        <div
          key={mentor.id}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
        >
          <div className="flex-1">
            <Link href={`/mentors/${mentor.id}`} className="font-medium hover:underline">
              {mentor.name}
            </Link>
            <p className="text-sm text-white/60">{mentor.tagline}</p>
          </div>
          <Button
            onClick={() => handleRemove(mentor.id)}
            disabled={removing === mentor.id}
            variant="ghost"
            size="sm"
          >
            {removing === mentor.id ? "Removing..." : "Remove"}
          </Button>
        </div>
      ))}

      {mentors.length > 3 && (
        <Button href="/saved" variant="ghost" size="sm" className="w-full">
          View All Saved Mentors →
        </Button>
      )}
    </div>
  );
}
