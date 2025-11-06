"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import Input from "@/components/common/Input";
import FormFieldError from "@/components/common/FormFieldError";
import { useUploadThing } from "@/lib/uploadthing";
import { Upload, Camera } from "lucide-react";

interface Step2ProfileDetailsProps {
  initialData?: {
    bio?: string;
    profileImage?: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      website?: string;
      youtube?: string;
    };
  };
  onNext: (data: {
    bio: string;
    profileImage: string;
    socialLinks: {
      twitter?: string;
      linkedin?: string;
      website?: string;
      youtube?: string;
    };
  }) => void;
  onBack: () => void;
}

export default function Step2ProfileDetails({
  initialData,
  onNext,
  onBack,
}: Step2ProfileDetailsProps) {
  const [bio, setBio] = useState(initialData?.bio || "");
  const [profileImage, setProfileImage] = useState(initialData?.profileImage || "");
  const [twitter, setTwitter] = useState(initialData?.socialLinks?.twitter || "");
  const [linkedin, setLinkedin] = useState(initialData?.socialLinks?.linkedin || "");
  const [website, setWebsite] = useState(initialData?.socialLinks?.website || "");
  const [youtube, setYoutube] = useState(initialData?.socialLinks?.youtube || "");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { startUpload } = useUploadThing("avatarUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        setProfileImage(res[0].url);
        setUploading(false);
      }
    },
    onUploadError: (error: Error) => {
      setError(`Upload failed: ${error.message}`);
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
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("[Step2ProfileDetails] Camera failed:", err);
      setError("Failed to access camera");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!bio.trim()) {
      setError("Bio is required");
      return;
    }

    if (bio.length < 50) {
      setError("Bio must be at least 50 characters");
      return;
    }

    if (!profileImage.trim()) {
      setError("Profile image is required");
      return;
    }

    onNext({
      bio: bio.trim(),
      profileImage: profileImage.trim(),
      socialLinks: {
        twitter: twitter.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        website: website.trim() || undefined,
        youtube: youtube.trim() || undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Details</h2>
        <p className="text-white/60">
          Tell students about yourself and add links to your online presence.
        </p>
      </div>

      <div className="space-y-4">
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-white/80 mb-2">
            Bio *
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your experience, achievements, and what makes you a great mentor..."
            rows={6}
            maxLength={2000}
          />
          <p className="text-xs text-white/40 mt-1">
            {bio.length}/2000 characters (minimum 50)
          </p>
        </div>

        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Profile Image *
          </label>

          <div className="flex items-start gap-6">
            {/* Preview */}
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-white/10 bg-white/5">
                {profileImage ? (
                  <Image
                    src={profileImage}
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

            {/* Upload Controls */}
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
                  type="button"
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
                  type="button"
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

              <p className="text-xs text-white/40">
                JPG, PNG or GIF. Max size 4MB.
              </p>
            </div>
          </div>

          {/* Camera Modal */}
          {showCamera && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
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
                <Button type="button" onClick={takePhoto} variant="primary" size="sm">
                  Take Photo
                </Button>
                <Button type="button" onClick={stopCamera} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-3">
            Social Links (Optional)
          </h3>
          <div className="space-y-3">
            <Input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="Twitter/X Profile URL"
            />
            <Input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="LinkedIn Profile URL"
            />
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Personal Website URL"
            />
            <Input
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="YouTube Channel URL"
            />
          </div>
        </div>
      </div>

      {error && <FormFieldError error={error} />}

      <div className="flex justify-between">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" size="lg">
          Continue
        </Button>
      </div>
    </form>
  );
}
