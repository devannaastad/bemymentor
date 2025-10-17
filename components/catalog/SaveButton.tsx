// components/catalog/SaveButton.tsx
"use client";

import Button from "@/components/common/Button";
import { useSaved } from "./useSaved";

export default function SaveButton({ id }: { id: string }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(id);

  return (
    <Button
      variant={saved ? "primary" : "ghost"}
      onClick={(e) => {
        e.preventDefault();
        toggle(id);
      }}
    >
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
