// components/settings/AvatarUploader.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { Button } from "@/components/common";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Props = { initialUrl?: string | null };

export default function AvatarUploader({ initialUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { update } = useSession(); // ← client-side session refresh

  async function persist(url: string) {
    setSaving(true);
    try {
      // 1) Save URL to DB
      const res = await fetch("/api/avatar/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save avatar");
      }

      // 2) Update local preview immediately
      setPreview(url);

      // 3) Refresh NextAuth session (client) so Navbar picks the new image
      try {
        await update(); // v5 client API to refetch the session
      } catch {
        // no-op
      }

      // 4) Revalidate RSC tree
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-white/5">
          {preview ? (
            <Image src={preview} alt="Profile avatar" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
              No photo
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <UploadButton<OurFileRouter, "avatarUploader">
            endpoint="avatarUploader"
            content={{
              button({ isUploading }) {
                return isUploading ? "Uploading…" : "Choose photo";
              },
            }}
            appearance={{
              button:
                "rounded-md border border-white/15 px-3 py-1.5 text-sm text-neutral-100 bg-white/5 hover:bg-white/10",
              allowedContent: "text-xs text-neutral-400 mt-1",
            }}
            onClientUploadComplete={async (files) => {
              const url = files?.[0]?.url;
              if (!url) return;
              await persist(url);
            }}
            onUploadError={(err) => {
              console.error(err);
              alert(err.message || "Upload failed");
            }}
          />

          <div className="flex gap-2">
            <Button
              disabled={saving}
              onClick={() => setPreview(initialUrl ?? null)}
            >
              Reset
            </Button>
          </div>

          <p className="text-xs text-neutral-400">
            JPG/PNG/WebP up to 4MB. Cropped to a circle in the UI.
          </p>
        </div>
      </div>
    </div>
  );
}
