// components/apply/ApplyForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationFormSchema,
  type ApplicationFormValues,
} from "@/lib/schemas/application";

import SectionHeader from "@/components/common/SectionHeader";
import { Card, CardContent } from "@/components/common/Card";
import Label from "@/components/common/Label";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import FormFieldError from "@/components/common/FormFieldError";
import Spinner from "@/components/common/Spinner";

export default function ApplyForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      offerType: "BOTH",
      price: "",
      hourlyRate: "",
    },
  });

  const offerType = watch("offerType");

  async function onSubmit(values: ApplicationFormValues) {
    setServerError(null);
    setSuccessMessage(null);

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data?.message ?? "Could not submit. Please try again.";
      setServerError(message);
      return;
    }

    setSuccessMessage(data.message ?? "Application submitted successfully!");
    reset({ offerType: "BOTH", price: "", hourlyRate: "" });
    
    // Scroll to top to see success message
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="section">
      <SectionHeader
        title="Apply to become a mentor"
        subtitle="Tell us what you teach, show proof of expertise, and we'll review your application. After approval you'll connect payouts via Stripe."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="container mt-8 grid gap-4 md:max-w-2xl">
        {/* Success Message */}
        {successMessage && (
          <Card className="border-emerald-500/20 bg-emerald-500/10">
            <CardContent>
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-emerald-200">{successMessage}</p>
                  <p className="mt-1 text-sm text-emerald-300/80">
                    We'll email you at <strong>{watch("email")}</strong> once we've reviewed your application.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {serverError && (
          <Card className="border-rose-500/20 bg-rose-500/10">
            <CardContent>
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-rose-200">{serverError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" placeholder="Your name" {...register("fullName")} />
            <FormFieldError message={errors.fullName?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="you@example.com" 
              autoComplete="email" 
              {...register("email")} 
            />
            <FormFieldError message={errors.email?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <Label htmlFor="topic">What do you teach?</Label>
            <Input 
              id="topic"
              placeholder="e.g., Day trading, Valorant coaching" 
              {...register("topic")} 
            />
            <FormFieldError message={errors.topic?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <Label htmlFor="proofLinks">Proof links</Label>
            <Textarea 
              id="proofLinks"
              placeholder="Portfolio, ranks, results, testimonials…" 
              {...register("proofLinks")} 
            />
            <FormFieldError message={errors.proofLinks?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="offerType">What will you offer?</Label>
              <Select id="offerType" {...register("offerType")}>
                <option value="ACCESS">ACCESS (digital assets)</option>
                <option value="TIME">TIME (live sessions)</option>
                <option value="BOTH">Both</option>
              </Select>
              <FormFieldError message={errors.offerType?.message} />
            </div>

            {offerType !== "TIME" && (
              <div className="grid gap-2">
                <Label htmlFor="price">ACCESS price (USD)</Label>
                <Input 
                  id="price"
                  placeholder="e.g., 20" 
                  type="number"
                  min="0"
                  step="1"
                  {...register("price")} 
                />
                <FormFieldError message={errors.price?.message} />
              </div>
            )}

            {offerType !== "ACCESS" && (
              <div className="grid gap-2">
                <Label htmlFor="hourlyRate">TIME hourly rate (USD)</Label>
                <Input 
                  id="hourlyRate"
                  placeholder="e.g., 30" 
                  type="number"
                  min="0"
                  step="1"
                  {...register("hourlyRate")} 
                />
                <FormFieldError message={errors.hourlyRate?.message} />
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting || !!successMessage}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner size={16} /> Submitting…
            </span>
          ) : (
            "Submit application"
          )}
        </Button>
      </form>
    </section>
  );
}