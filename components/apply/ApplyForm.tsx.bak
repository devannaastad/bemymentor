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

export default function ApplyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-white/90">
          Full Name <span className="text-rose-400">*</span>
        </label>
        <Input
          id="fullName"
          {...register("fullName")}
          placeholder="Your full name"
        />
        {errors.fullName?.message && <FormFieldError error={errors.fullName.message} />}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/90">
          Email <span className="text-rose-400">*</span>
        </label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email?.message && <FormFieldError error={errors.email.message} />}
      </div>

      {/* Topic */}
      <div>
        <label htmlFor="topic" className="mb-2 block text-sm font-medium text-white/90">
          What do you teach? <span className="text-rose-400">*</span>
        </label>
        <Input
          id="topic"
          {...register("topic")}
          placeholder="e.g., Crypto trading, Valorant coaching, UX design"
        />
        {errors.topic?.message && <FormFieldError error={errors.topic.message} />}
        <p className="mt-1 text-xs text-white/50">
          Keep it short and clear (max 120 characters)
        </p>
      </div>

      {/* Proof Links */}
      <div>
        <label htmlFor="proofLinks" className="mb-2 block text-sm font-medium text-white/90">
          Proof Links <span className="text-rose-400">*</span>
        </label>
        <Textarea
          id="proofLinks"
          {...register("proofLinks")}
          rows={4}
          placeholder="Add links to your portfolio, rank screenshots, client results, social proof, etc."
        />
        {errors.proofLinks?.message && <FormFieldError error={errors.proofLinks.message} />}
        <p className="mt-1 text-xs text-white/50">
          Provide evidence of your expertise (portfolio, results, certifications, etc.)
        </p>
      </div>

      {/* Offer Type */}
      <div>
        <label htmlFor="offerType" className="mb-2 block text-sm font-medium text-white/90">
          What do you offer? <span className="text-rose-400">*</span>
        </label>
        <Select id="offerType" {...register("offerType")}>
          <option value="ACCESS">ACCESS - Digital product (guide, course, community)</option>
          <option value="TIME">TIME - Live 1-on-1 sessions</option>
          <option value="BOTH">BOTH - Digital product + live sessions</option>
        </Select>
        {errors.offerType?.message && <FormFieldError error={errors.offerType.message} />}
      </div>

      {/* Conditional Pricing Fields */}
      {(offerType === "ACCESS" || offerType === "BOTH") && (
        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-medium text-white/90">
            ACCESS Price (USD) <span className="text-rose-400">*</span>
          </label>
          <Input
            id="price"
            type="number"
            {...register("price")}
            placeholder="49"
          />
          {errors.price?.message && <FormFieldError error={errors.price.message} />}
          <p className="mt-1 text-xs text-white/50">
            One-time price for your digital product/community access
          </p>
        </div>
      )}

      {(offerType === "TIME" || offerType === "BOTH") && (
        <div>
          <label htmlFor="hourlyRate" className="mb-2 block text-sm font-medium text-white/90">
            Hourly Rate (USD) <span className="text-rose-400">*</span>
          </label>
          <Input
            id="hourlyRate"
            type="number"
            {...register("hourlyRate")}
            placeholder="100"
          />
          {errors.hourlyRate?.message && <FormFieldError error={errors.hourlyRate.message} />}
          <p className="mt-1 text-xs text-white/50">
            Your rate for 1-on-1 coaching sessions
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}