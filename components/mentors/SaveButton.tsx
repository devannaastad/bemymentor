// components/mentors/SaveButton.tsx//
"use client";

import { useTransition } from "react";
import Button from "@/components/common/Button";
import { useSaved } from "@/components/catalog/useSaved";

function BookmarkIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z" fill="currentColor" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function SaveButton({ mentorId }: { mentorId: string }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(mentorId);
  const [pending, start] = useTransition();

  return (
    <Button
      variant={saved ? "primary" : "ghost"}
      aria-pressed={saved}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        start(() => toggle(mentorId));
      }}
      className="inline-flex items-center gap-2"
    >
      <BookmarkIcon filled={saved} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
