// components/settings/AvatarUploader.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/common/Button";
import { toast } from "@/components/common/Toast";
import { UploadButton } from "@/lib/uploadthing";

interface AvatarUploaderProps {
  initialUrl: string | null;
}

export default function AvatarUploader({ initialUrl }: AvatarUploaderProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (!confirm("Remove your profile photo?")) return;

    setRemoving(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "" }),
      });

      if (!res.ok) throw new Error("Failed to remove");

      setAvatarUrl(null);
      toast("Profile photo removed", "success");
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("[AvatarUploader] Remove failed:", err);
      toast("Failed to remove photo", "error");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex items-start gap-6">
      <div className="relative">
        <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 bg-white/5">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile photo"
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white/40">
              ?
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <UploadButton
          endpoint="avatarUploader"
          onClientUploadComplete={(res) => {
            if (res?.[0]?.url) {
              setAvatarUrl(res[0].url);
              toast("Profile photo updated!", "success");
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }
          }}
          onUploadError={(error: Error) => {
            toast(`Upload failed: ${error.message}`, "error");
          }}
        />

        {avatarUrl && (
          <Button
            onClick={handleRemove}
            variant="ghost"
            size="sm"
            disabled={removing}
          >
            {removing ? "Removing..." : "Remove Photo"}
          </Button>
        )}

        <p className="text-xs text-white/50">
          JPG, PNG or GIF. Max size 4MB.
        </p>
      </div>
    </div>
  );
}