// components/catalog/SavedLoader.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const KEY = "bmm_saved_mentors";

export default function SavedLoader() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    // If ?ids is already present, do nothing
    if (sp.get("ids")) return;

    try {
      const raw = localStorage.getItem(KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (Array.isArray(ids) && ids.length > 0) {
        router.replace(`/saved?ids=${encodeURIComponent(ids.join(","))}`);
      }
    } catch {
      // ignore
    }
  }, [router, sp]);

  return null;
}
