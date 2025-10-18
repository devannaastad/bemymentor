// components/catalog/useSaved.ts
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { toast } from "@/components/common/Toast";

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
  } catch {
    // ignore
  }
}

export function useSaved() {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

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
      try {
        const res = await fetch("/api/saved", { cache: "no-store" });
        if (!res.ok) {
          console.error("[useSaved] Failed to fetch:", res.status);
          setIds(new Set());
          return;
        }
        const json = (await res.json()) as { ok: boolean; data: { id: string }[] };
        if (cancelled) return;
        const savedIds = new Set(json.data.map((m) => m.id));
        setIds(savedIds);
        
        // Sync to localStorage as backup
        writeLocal(savedIds);
      } catch (error) {
        console.error("[useSaved] Load error:", error);
        setIds(new Set());
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  const isSaved = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(async (id: string) => {
    const currentlySaved = ids.has(id);
    
    // Optimistic UI update
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    if (isAuthed) {
      // Call API with correct endpoints
      setLoading(true);
      try {
        if (currentlySaved) {
          // Unsave - DELETE /api/saved/:id
          const res = await fetch(`/api/saved/${id}`, { method: "DELETE" });
          if (!res.ok) {
            console.error("[useSaved] Unsave failed:", res.status);
            toast("Failed to unsave mentor", "error");
            // Rollback optimistic update
            setIds((prev) => {
              const next = new Set(prev);
              next.add(id);
              return next;
            });
          } else {
            console.log("[useSaved] Unsaved:", id);
            toast("Mentor removed from saved", "success");
          }
        } else {
          // Save - POST /api/saved/:id
          const res = await fetch(`/api/saved/${id}`, { method: "POST" });
          if (!res.ok) {
            console.error("[useSaved] Save failed:", res.status);
            toast("Failed to save mentor", "error");
            // Rollback optimistic update
            setIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          } else {
            console.log("[useSaved] Saved:", id);
            toast("Mentor saved!", "success");
          }
        }
        
        // Update localStorage backup
        setIds((current) => {
          writeLocal(current);
          return current;
        });
      } catch (error) {
        console.error("[useSaved] Toggle error:", error);
        toast("Something went wrong", "error");
        // Rollback optimistic update
        setIds((prev) => {
          const next = new Set(prev);
          if (currentlySaved) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
      } finally {
        setLoading(false);
      }
    } else {
      // localStorage fallback for non-authenticated users
      setIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) {
          next.delete(id);
          toast("Mentor removed from saved", "info");
        } else {
          next.add(id);
          toast("Mentor saved locally (sign in to sync)", "info");
        }
        writeLocal(next);
        return next;
      });
    }
  }, [ids, isAuthed]);

  return useMemo(
    () => ({ isSaved, toggle, ids, loading }), 
    [ids, loading, isSaved, toggle]
  );
}

export default useSaved;