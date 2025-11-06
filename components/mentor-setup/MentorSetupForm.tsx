// components/mentor-setup/MentorSetupForm.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mentorSetupSchema, type MentorSetupFormValues } from "@/lib/schemas/mentor-setup";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import FormFieldError from "@/components/common/FormFieldError";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";
import { Upload, Camera } from "lucide-react";
import Image from "next/image";

export default function MentorSetupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MentorSetupFormValues>({
    resolver: zodResolver(mentorSetupSchema),
  });

  const { startUpload } = useUploadThing("avatarUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        const url = res[0].url;
        setProfileImage(url);
        setValue("profileImage", url);
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
      console.error("[MentorSetupForm] Camera failed:", err);
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

  const onSubmit = async (data: MentorSetupFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/mentor-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Failed to create profile");
      }

      // Success - redirect to mentor dashboard or profile
      router.push("/dashboard?setup=complete");
    } catch (err) {
      console.error("[MentorSetupForm] Submit failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      {/* Bio */}
      <div>
        <label htmlFor="bio" className="mb-2 block text-sm font-medium text-white/90">
          Bio / About You <span className="text-rose-400">*</span>
        </label>
        <Textarea
          id="bio"
          {...register("bio")}
          rows={8}
          placeholder="Tell learners about your background, expertise, teaching style, and what makes you qualified to mentor in your topic..."
        />
        {errors.bio?.message && <FormFieldError error={errors.bio.message} />}
        <p className="mt-1 text-xs text-white/50">
          Min 50 characters. Share your story, credentials, and what students can expect.
        </p>
      </div>

      {/* Profile Image */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white/90">
          Profile Image
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

            <p className="text-xs text-white/50">
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

        {errors.profileImage?.message && <FormFieldError error={errors.profileImage.message} />}
      </div>

      {/* Social Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="twitterUrl" className="mb-2 block text-sm font-medium text-white/90">
            Twitter / X
          </label>
          <Input
            id="twitterUrl"
            type="url"
            {...register("twitterUrl")}
            placeholder="https://twitter.com/yourhandle"
          />
          {errors.twitterUrl?.message && <FormFieldError error={errors.twitterUrl.message} />}
        </div>

        <div>
          <label htmlFor="linkedinUrl" className="mb-2 block text-sm font-medium text-white/90">
            LinkedIn
          </label>
          <Input
            id="linkedinUrl"
            type="url"
            {...register("linkedinUrl")}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          {errors.linkedinUrl?.message && <FormFieldError error={errors.linkedinUrl.message} />}
        </div>
      </div>

      <div>
        <label htmlFor="websiteUrl" className="mb-2 block text-sm font-medium text-white/90">
          Personal Website
        </label>
        <Input
          id="websiteUrl"
          type="url"
          {...register("websiteUrl")}
          placeholder="https://yourwebsite.com"
        />
        {errors.websiteUrl?.message && <FormFieldError error={errors.websiteUrl.message} />}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Creating Profile..." : "Complete Setup →"}
      </Button>
    </form>
  );
}