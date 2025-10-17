// app/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/auth/SessionProvider";

export default function LogoutPage() {
  const { signOut } = useSession();
  const router = useRouter();

  useEffect(() => {
    signOut();
    const t = setTimeout(() => router.push("/"), 500);
    return () => clearTimeout(t);
  }, [router, signOut]);

  return (
    <section className="section">
      <div className="container">
        <p className="muted">Signing you out…</p>
      </div>
    </section>
  );
}
