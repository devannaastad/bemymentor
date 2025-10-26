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
import { AlertCircle } from "lucide-react";

export default function ApplyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      offerType: "ACCESS",
    },
  });

  const offerType = watch("offerType");

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

      {/* Topic */}
      <div>
        <label htmlFor="topic" className="mb-2 block text-base font-semibold text-white">
          What do you teach? <span className="text-rose-400">*</span>
        </label>
        <Input
          id="topic"
          {...register("topic")}
          placeholder="e.g., Crypto trading, Valorant coaching, UX design"
          className="h-12 text-base"
        />
        {errors.topic?.message && <FormFieldError error={errors.topic.message} />}
        <p className="mt-2 text-sm text-white/50">
          Keep it clear and concise (max 120 characters)
        </p>
      </div>

      {/* Proof Links */}
      <div>
        <label htmlFor="proofLinks" className="mb-2 block text-base font-semibold text-white">
          Proof of Expertise <span className="text-rose-400">*</span>
        </label>
        <Textarea
          id="proofLinks"
          {...register("proofLinks")}
          rows={5}
          placeholder="Provide links to prove your expertise:&#10;&#10;• Portfolio/website&#10;• Rank screenshots (for gaming)&#10;• Client testimonials&#10;• Social media accounts&#10;• Certifications&#10;• Case studies or results"
          className="text-base"
        />
        {errors.proofLinks?.message && <FormFieldError error={errors.proofLinks.message} />}
        <div className="mt-3 rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Strong applications include:</p>
              <ul className="space-y-1 text-blue-200/80">
                <li>• Screenshots showing your rank/results</li>
                <li>• Links to your portfolio or past work</li>
                <li>• Social proof (testimonials, followers, etc.)</li>
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
          <option value="ACCESS">📚 ACCESS - Digital product (guide, course, community)</option>
          <option value="TIME">🎯 TIME - Live 1-on-1 sessions</option>
          <option value="BOTH">⚡ BOTH - Digital product + live sessions</option>
        </Select>
        {errors.offerType?.message && <FormFieldError error={errors.offerType.message} />}
        <p className="mt-2 text-sm text-white/50">
          Choose what best fits your teaching style
        </p>
      </div>

      {/* Conditional Pricing Fields */}
      {(offerType === "ACCESS" || offerType === "BOTH") && (
        <div>
          <label htmlFor="price" className="mb-2 block text-base font-semibold text-white">
            ACCESS Price (USD) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg font-medium">
              $
            </span>
            <Input
              id="price"
              type="number"
              {...register("price")}
              placeholder="49"
              className="h-12 text-base pl-8"
            />
          </div>
          {errors.price?.message && <FormFieldError error={errors.price.message} />}
          <p className="mt-2 text-sm text-white/50">
            One-time price for your digital product/community access
          </p>
        </div>
      )}

      {(offerType === "TIME" || offerType === "BOTH") && (
        <div>
          <label htmlFor="hourlyRate" className="mb-2 block text-base font-semibold text-white">
            Hourly Rate (USD) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg font-medium">
              $
            </span>
            <Input
              id="hourlyRate"
              type="number"
              {...register("hourlyRate")}
              placeholder="100"
              className="h-12 text-base pl-8"
            />
          </div>
          {errors.hourlyRate?.message && <FormFieldError error={errors.hourlyRate.message} />}
          <p className="mt-2 text-sm text-white/50">
            Your rate for 1-on-1 coaching sessions
          </p>
        </div>
      )}

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
