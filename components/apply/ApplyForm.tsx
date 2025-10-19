// components/apply/ApplyForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Label from "@/components/common/Label";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import FormFieldError from "@/components/common/FormFieldError";
import Spinner from "@/components/common/Spinner";
import { toast } from "@/components/common/Toast";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  topic: z.string().min(5, "Topic must be at least 5 characters"),
  proofLinks: z.string().min(10, "Please provide proof links"),
  offerType: z.enum(["ACCESS", "TIME", "BOTH"]),
  accessPrice: z.number().min(1).optional().nullable(),
  hourlyRate: z.number().min(1).optional().nullable(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function ApplyForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      offerType: "BOTH",
    },
  });

  const offerType = watch("offerType");

  const onSubmit = async (data: ApplicationFormData) => {
    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        toast(json.error || "Failed to submit application", "error");
        setSubmitting(false);
        return;
      }

      toast("Application submitted successfully! Check your email.", "success");
      
      setTimeout(() => {
        router.push("/apply/success");
      }, 1500);
    } catch (error) {
      console.error("Submit error:", error);
      toast("Something went wrong. Please try again.", "error");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="Jane Doe"
            {...register("fullName")}
          />
          <FormFieldError message={errors.fullName?.message} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            {...register("email")}
          />
          <FormFieldError message={errors.email?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="topic">What will you mentor in?</Label>
        <Input
          id="topic"
          placeholder="e.g., Advanced Valorant strategies and aim training"
          {...register("topic")}
        />
        <FormFieldError message={errors.topic?.message} />
      </div>

      <div>
        <Label htmlFor="proofLinks">Proof Links</Label>
        <Textarea
          id="proofLinks"
          placeholder="Provide links to your achievements, social profiles, certifications, etc."
          rows={4}
          {...register("proofLinks")}
        />
        <FormFieldError message={errors.proofLinks?.message} />
      </div>

      <div>
        <Label htmlFor="offerType">What will you offer?</Label>
        <Select id="offerType" {...register("offerType")}>
          <option value="ACCESS">ACCESS only (community, resources)</option>
          <option value="TIME">TIME only (1-on-1 sessions)</option>
          <option value="BOTH">Both ACCESS and TIME</option>
        </Select>
      </div>

      {(offerType === "ACCESS" || offerType === "BOTH") && (
        <div>
          <Label htmlFor="accessPrice">ACCESS price (monthly, USD)</Label>
          <Input
            id="accessPrice"
            type="number"
            placeholder="25"
            {...register("accessPrice", { valueAsNumber: true })}
          />
          <FormFieldError message={errors.accessPrice?.message} />
        </div>
      )}

      {(offerType === "TIME" || offerType === "BOTH") && (
        <div>
          <Label htmlFor="hourlyRate">Hourly rate (USD)</Label>
          <Input
            id="hourlyRate"
            type="number"
            placeholder="50"
            {...register("hourlyRate", { valueAsNumber: true })}
          />
          <FormFieldError message={errors.hourlyRate?.message} />
        </div>
      )}

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-200">
          We&apos;ll email you at <strong>{watch("email")}</strong> once we&apos;ve reviewed your application.
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={submitting}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            Submitting...
          </span>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}