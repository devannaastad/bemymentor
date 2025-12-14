// components/mentor/MentorAvatarUploader.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/common/Button";
import { toast } from "@/components/common/Toast";
import { Camera, Upload } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { useProfileEditor } from "./ProfileEditorContext";

interface MentorAvatarUploaderProps {
  initialUrl: string | null;
}

export default function MentorAvatarUploader({ initialUrl }: MentorAvatarUploaderProps) {
  const { updateField } = useProfileEditor();
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { startUpload } = useUploadThing("avatarUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        const url = res[0].url;
        setAvatarUrl(url);
        updateField("profileImage", url);
        toast("Profile photo uploaded! Remember to save your changes.", "success");
        setUploading(false);
      }
    },
    onUploadError: (error: Error) => {
      toast(`Upload failed: ${error.message}`, "error");
      setUploading(false);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    await startUpload([file]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      streamRef.current = stream;
      setShowCamera(true);

      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Play the video once metadata is loaded
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => {
              console.error("[MentorAvatarUploader] Video play failed:", err);
            });
          };
        }
      }, 100);
    } catch (err) {
      console.error("[MentorAvatarUploader] Camera failed:", err);
      toast("Failed to access camera. Please ensure you've granted camera permissions.", "error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally (mirror image) so it looks natural
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
      setUploading(true);
      stopCamera();
      await startUpload([file]);
    }, "image/jpeg", 0.95);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-white/10 bg-white/5">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile photo"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Camera className="h-8 w-8 text-white/40" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              size="sm"
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Choose Photo"}
            </Button>

            <Button
              onClick={startCamera}
              variant="ghost"
              size="sm"
              disabled={uploading || showCamera}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
          </div>

          <p className="text-xs text-white/50">
            JPG, PNG or GIF. Max size 4MB. Changes are saved when you click &quot;Save Changes&quot; at the bottom.
          </p>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={takePhoto} variant="primary" size="sm">
              Take Photo
            </Button>
            <Button onClick={stopCamera} variant="ghost" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
