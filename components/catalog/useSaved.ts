// components/catalog/useSaved.ts
"use client";

import { useEffect, useState } from "react";

const KEY = "bmm_saved_mentors";

export function useSaved() {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  function persist(next: Set<string>) {
    setSaved(new Set(next));
    try {
      localStorage.setItem(KEY, JSON.stringify(Array.from(next)));
    } catch {}
  }

  function toggle(id: string) {
    const next = new Set(saved);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  }

  const isSaved = (id: string) => saved.has(id);

  return { saved, isSaved, toggle };
}
