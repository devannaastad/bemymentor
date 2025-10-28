// components/common/GlobalLoading.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalLoading() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleStart = () => setLoading(true);

    // Listen for route changes
    window.addEventListener("beforeunload", handleStart);

    return () => {
      window.removeEventListener("beforeunload", handleStart);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className="fixed left-0 top-0 z-[9999] h-1 bg-gradient-to-r from-purple-600 via-amber-500 to-purple-600 transition-all duration-300"
      style={{
        width: "100%",
        animation: "loading 1s ease-in-out infinite",
      }}
    >
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
