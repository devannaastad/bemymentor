// components/mentor-setup/MentorSetupForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mentorSetupSchema, type MentorSetupFormValues } from "@/lib/schemas/mentor-setup";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import FormFieldError from "@/components/common/FormFieldError";
import { useRouter } from "next/navigation";

export default function MentorSetupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MentorSetupFormValues>({
    resolver: zodResolver(mentorSetupSchema),
  });

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
        <label htmlFor="profileImage" className="mb-2 block text-sm font-medium text-white/90">
          Profile Image URL
        </label>
        <Input
          id="profileImage"
          type="url"
          {...register("profileImage")}
          placeholder="https://example.com/your-photo.jpg"
        />
        {errors.profileImage?.message && <FormFieldError error={errors.profileImage.message} />}
        <p className="mt-1 text-xs text-white/50">
          Upload your photo to a service like Imgur or use your social media profile picture URL.
        </p>
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