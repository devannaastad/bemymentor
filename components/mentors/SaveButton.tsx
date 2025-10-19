// components/mentors/SaveButton.tsx
"use client";

import { useTransition } from "react";
import Button from "@/components/common/Button";
import { useSaved } from "@/components/catalog/useSaved";

function BookmarkIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z" fill="currentColor" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function SaveButton({ mentorId }: { mentorId: string }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(mentorId);
  const [pending, start] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    start(() => toggle(mentorId));
  };

  return (
    <Button
      variant={saved ? "primary" : "ghost"}
      size="lg"
      disabled={pending}
      onClick={handleClick}
      className="inline-flex items-center gap-2"
    >
      <BookmarkIcon filled={saved} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}