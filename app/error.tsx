// app/error.tsx
"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <section className="section">
      <div className="container max-w-2xl">
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardContent className="text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h1 className="h2 mb-2">Something Went Wrong</h1>
            <p className="mb-6 text-white/70">
              An unexpected error occurred. Don&apos;t worry, our team has been notified.
            </p>
            {process.env.NODE_ENV === "development" && (
              <div className="mb-6 rounded-lg bg-black/30 p-4 text-left">
                <p className="text-xs text-rose-300">
                  <strong>Error:</strong> {error.message}
                </p>
              </div>
            )}
            <div className="flex justify-center gap-3">
              <Button onClick={reset}>Try Again</Button>
              <Button href="/" variant="ghost">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}