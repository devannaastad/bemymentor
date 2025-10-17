// components/auth/SessionProvider.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { name: string; email: string };

type Session = {
  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;
};

const KEY = "bmm_user";
const SessionCtx = createContext<Session | null>(null);

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const value = useMemo<Session>(
    () => ({
      user,
      signIn: (u: User) => {
        try {
          localStorage.setItem(KEY, JSON.stringify(u));
        } catch {}
        setUser(u);
      },
      signOut: () => {
        try {
          localStorage.removeItem(KEY);
        } catch {}
        setUser(null);
      },
    }),
    [user]
  );

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
