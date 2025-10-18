// components/catalog/useSaved.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";

const LS_KEY = "savedMentorIds";

/** Read/write localStorage set */
function readLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    return new Set<string>(JSON.parse(raw));
  } catch {
    return new Set();
  }
}
function writeLocal(ids: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
  } catch {}
}

export function useSaved() {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const [ids, setIds] = useState<Set<string>>(new Set());

  // Load initial state
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isAuthed) {
        // local only
        setIds(readLocal());
        return;
      }
      // DB: fetch full mentors then keep just their ids locally
      const res = await fetch("/api/saved", { cache: "no-store" });
      if (!res.ok) {
        setIds(new Set());
        return;
      }
      const json = (await res.json()) as { ok: boolean; data: { id: string }[] };
      if (cancelled) return;
      setIds(new Set(json.data.map((m) => m.id)));
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  const isSaved = (id: string) => ids.has(id);

  const toggle = async (id: string) => {
    // optimistic UI
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    if (isAuthed) {
      // call API
      const currentlySaved = ids.has(id);
      if (currentlySaved) {
        await fetch(`/api/saved?mentorId=${encodeURIComponent(id)}`, { method: "DELETE" });
      } else {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mentorId: id }),
        });
      }
    } else {
      // localStorage fallback
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeLocal(next);
    }
  };

  return useMemo(() => ({ isSaved, toggle, ids }), [ids]); // eslint-disable-line react-hooks/exhaustive-deps
}

export default useSaved;
