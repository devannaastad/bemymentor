// components/apply/ApplyForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  applicationFormSchema,
  type ApplicationFormValues,
} from "@/lib/schemas/application";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import FormFieldError from "@/components/common/FormFieldError";
import { AlertCircle, X } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { MentorCategory } from "@prisma/client";
import { getCategoryLabel } from "@/lib/utils/categories";

export default function ApplyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [proofImages, setProofImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      offerType: "ACCESS",
      socialProof: {},
    },
  });

  const offerType = watch("offerType");
  const category = watch("category");

  const onSubmit = async (data: ApplicationFormValues) => {
    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      console.log("Bot detected via honeypot");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Failed to submit application");
      }

      // Success - redirect to success page
      router.push("/apply/success");
    } catch (err) {
      console.error("[ApplyForm] Submit failed:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
      {/* Honeypot field - hidden from users, visible to bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: "absolute", left: "-9999px" }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="mb-2 block text-base font-semibold text-white">
          Full Name <span className="text-rose-400">*</span>
        </label>
        <Input
          id="fullName"
          {...register("fullName")}
          placeholder="John Doe"
          className="h-12 text-base"
        />
        {errors.fullName?.message && <FormFieldError error={errors.fullName.message} />}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-2 block text-base font-semibold text-white">
          Email Address <span className="text-rose-400">*</span>
        </label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john@example.com"
          className="h-12 text-base"
        />
        {errors.email?.message && <FormFieldError error={errors.email.message} />}
        <p className="mt-2 text-sm text-white/50">
          We&apos;ll send your approval notification to this email
        </p>
      </div>

      {/* Phone (Optional) */}
      <div>
        <label htmlFor="phone" className="mb-2 block text-base font-semibold text-white">
          Phone Number <span className="text-white/40 text-sm font-normal">(Optional)</span>
        </label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="+1 (555) 123-4567"
          className="h-12 text-base"
        />
        {errors.phone?.message && <FormFieldError error={errors.phone.message} />}
        <p className="mt-2 text-sm text-white/50">
          Optional - helps us reach you faster if needed
        </p>
      </div>

      {/* Topic */}
      <div>
        <label htmlFor="topic" className="mb-2 block text-base font-semibold text-white">
          What do you teach? <span className="text-rose-400">*</span>
        </label>
        <Input
          id="topic"
          {...register("topic")}
          placeholder="e.g., Valorant aim coaching, Day trading strategies, YouTube editing"
          className="h-12 text-base"
        />
        {errors.topic?.message && <FormFieldError error={errors.topic.message} />}
        <p className="mt-2 text-sm text-white/50">
          Focus areas: Gaming & Esports, Trading & Investing, Streaming, YouTube Production
        </p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="mb-2 block text-base font-semibold text-white">
          Category <span className="text-white/40 text-sm font-normal">(Optional)</span>
        </label>
        <Select id="category" {...register("category")} className="h-12 text-base">
          <option value="">Select a category...</option>
          {Object.values(MentorCategory).map((cat) => (
            <option key={cat} value={cat}>
              {getCategoryLabel(cat)}
            </option>
          ))}
        </Select>
        {errors.category?.message && <FormFieldError error={errors.category.message} />}
        <p className="mt-2 text-sm text-white/50">
          Choose the category that best fits your expertise
        </p>
      </div>

      {/* Custom Category (only shown when OTHER is selected) */}
      {category === "OTHER" && (
        <div>
          <label htmlFor="customCategory" className="mb-2 block text-base font-semibold text-white">
            Describe your mentorship area <span className="text-rose-400">*</span>
          </label>
          <Input
            id="customCategory"
            {...register("customCategory")}
            placeholder="e.g., Life coaching, Music production, Photography"
            className="h-12 text-base"
          />
          {errors.customCategory?.message && <FormFieldError error={errors.customCategory.message} />}
          <p className="mt-2 text-sm text-white/50">
            Tell us what you specialize in
          </p>
        </div>
      )}

      {/* Proof of Expertise Section */}
      <div className="space-y-6 rounded-lg border border-primary-500/20 bg-primary-500/5 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Proof of Expertise</h3>
          <p className="text-sm text-white/60">Help us verify your credentials by providing links and uploading proof</p>
        </div>

        {/* Social Proof Links */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-white">Social Links</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Portfolio/Website
              </label>
              <Input
                {...register("socialProof.portfolio")}
                placeholder="https://yourportfolio.com"
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                YouTube
              </label>
              <Input
                {...register("socialProof.youtube")}
                placeholder="https://youtube.com/@channel"
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Twitch
              </label>
              <Input
                {...register("socialProof.twitch")}
                placeholder="https://twitch.tv/username"
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Twitter / X
              </label>
              <Input
                {...register("socialProof.twitter")}
                placeholder="https://twitter.com/handle"
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Instagram
              </label>
              <Input
                {...register("socialProof.instagram")}
                placeholder="https://instagram.com/username"
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                TikTok
              </label>
              <Input
                {...register("socialProof.tiktok")}
                placeholder="https://tiktok.com/@username"
                className="h-10 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Other (LinkedIn, Discord, etc.)
            </label>
            <Input
              {...register("socialProof.other")}
              placeholder="Other relevant links"
              className="h-10 text-sm"
            />
          </div>
        </div>

        {/* Screenshot Upload */}
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-white">Upload Screenshots</h4>
          <p className="text-sm text-white/60">
            Upload images showing your expertise (ranks, results, certifications, testimonials, etc.)
          </p>

          {proofImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {proofImages.map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={url}
                    alt={`Proof ${index + 1}`}
                    width={200}
                    height={96}
                    className="w-full h-24 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = proofImages.filter((_, i) => i !== index);
                      setProofImages(updated);
                      setValue("proofImages", updated);
                    }}
                    className="absolute top-1 right-1 p-1 bg-rose-500 hover:bg-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <UploadButton
            endpoint="proofUploader"
            onClientUploadComplete={(res) => {
              if (res) {
                const urls = res.map((r) => r.url);
                const updated = [...proofImages, ...urls];
                setProofImages(updated);
                setValue("proofImages", updated);
              }
            }}
            onUploadError={(error: Error) => {
              alert(`Upload failed: ${error.message}`);
            }}
          />
          <p className="text-xs text-white/40">
            Max 5 images, 8MB each
          </p>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="proofLinks" className="mb-2 block text-base font-semibold text-white">
            Additional Proof/Notes <span className="text-rose-400">*</span>
          </label>
          <Textarea
            id="proofLinks"
            {...register("proofLinks")}
            rows={4}
            placeholder="Add any additional context, testimonials, achievements, or links that demonstrate your expertise..."
            className="text-base"
          />
          {errors.proofLinks?.message && <FormFieldError error={errors.proofLinks.message} />}
        </div>

        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Strong applications include:</p>
              <ul className="space-y-1 text-blue-200/80">
                <li>• Screenshots showing ranks, stats, or results</li>
                <li>• Social media profiles with following/engagement</li>
                <li>• Client testimonials or reviews</li>
                <li>• Relevant certifications or credentials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Type */}
      <div>
        <label htmlFor="offerType" className="mb-2 block text-base font-semibold text-white">
          What do you want to offer? <span className="text-rose-400">*</span>
        </label>
        <Select id="offerType" {...register("offerType")}>
          <option value="ACCESS">📚 Content Pass - Guides, Discord, resources (one-time fee)</option>
          <option value="TIME">🎯 Live Sessions - 1-on-1 video coaching (pay per hour)</option>
          <option value="BOTH">⚡ Both - Content + live sessions</option>
        </Select>
        {errors.offerType?.message && <FormFieldError error={errors.offerType.message} />}
        <p className="mt-2 text-sm text-white/50">
          Content Pass = lifetime access to your materials. Live Sessions = scheduled video calls. You can also add subscription plans later from your dashboard.
        </p>
      </div>

      {/* Conditional Pricing Fields */}
      {(offerType === "ACCESS" || offerType === "BOTH") && (
        <div>
          <label htmlFor="price" className="mb-2 block text-base font-semibold text-white">
            Content Pass Price (USD) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg font-medium">
              $
            </span>
            <Input
              id="price"
              type="text"
              inputMode="decimal"
              {...register("price")}
              placeholder="49.99"
              className="h-12 text-base pl-8"
            />
          </div>
          {errors.price?.message && <FormFieldError error={errors.price.message} />}
          <p className="mt-2 text-sm text-white/50">
            One-time fee for lifetime access to your guides, Discord, and resources
          </p>
        </div>
      )}

      {(offerType === "TIME" || offerType === "BOTH") && (
        <div>
          <label htmlFor="hourlyRate" className="mb-2 block text-base font-semibold text-white">
            Session Hourly Rate (USD) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg font-medium">
              $
            </span>
            <Input
              id="hourlyRate"
              type="text"
              inputMode="decimal"
              {...register("hourlyRate")}
              placeholder="100.00"
              className="h-12 text-base pl-8"
            />
          </div>
          {errors.hourlyRate?.message && <FormFieldError error={errors.hourlyRate.message} />}
          <p className="mt-2 text-sm text-white/50">
            Your rate for 1-on-1 coaching sessions
          </p>
        </div>
      )}

      {/* Subscription Options */}
      <div className="space-y-4 rounded-lg border border-purple-500/20 bg-purple-500/5 p-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Subscription Plans (Optional)</h3>
          <p className="text-sm text-white/60">
            Offer recurring subscriptions for ongoing mentorship and exclusive content
          </p>
        </div>

        {/* Weekly Subscription */}
        <div>
          <label htmlFor="weeklyPrice" className="mb-2 block text-base font-semibold text-white">
            Weekly Subscription Price (USD) <span className="text-white/40 text-sm font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg font-medium">
              $
            </span>
            <Input
              id="weeklyPrice"
              type="text"
              inputMode="decimal"
              {...register("weeklyPrice")}
              placeholder="25.00"
              className="h-12 text-base pl-8"
            />
          </div>
          {errors.weeklyPrice?.message && <FormFieldError error={errors.weeklyPrice.message} />}
          <p className="mt-2 text-sm text-white/50">
            Weekly recurring payment for ongoing access and support
          </p>
        </div>

        {/* Monthly Subscription */}
        <div>
          <label htmlFor="monthlyPrice" className="mb-2 block text-base font-semibold text-white">
            Monthly Subscription Price (USD) <span className="text-white/40 text-sm font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg font-medium">
              $
            </span>
            <Input
              id="monthlyPrice"
              type="text"
              inputMode="decimal"
              {...register("monthlyPrice")}
              placeholder="75.00"
              className="h-12 text-base pl-8"
            />
          </div>
          {errors.monthlyPrice?.message && <FormFieldError error={errors.monthlyPrice.message} />}
          <p className="mt-2 text-sm text-white/50">
            Monthly recurring payment for continuous mentorship
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-rose-200 mb-1">Submission Failed</p>
              <p className="text-sm text-rose-200/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto h-12 px-8 text-base font-semibold"
        >
          {isSubmitting ? "Submitting Application..." : "Submit Application"}
        </Button>
        <p className="mt-3 text-sm text-white/50">
          By submitting, you agree to our terms of service and mentor guidelines.
        </p>
      </div>
    </form>
  );
}
