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
  const [sent, setSent] = useState(false);

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
    setSent(false);

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      try {
        const data = await res.json();
        const message =
          data?.message ??
          (Array.isArray(data?.errors) ? data.errors[0]?.message : undefined) ??
          "Could not submit. Please try again.";
        setServerError(message);
      } catch {
        setServerError("Could not submit. Please try again.");
      }
      return;
    }

    setSent(true);
    reset({ offerType: "BOTH", price: "", hourlyRate: "" });
  }

  return (
    <section className="section">
      <SectionHeader
        title="Apply to become a mentor"
        subtitle="Tell us what you teach, show proof of expertise, and we’ll review your application. After approval you’ll connect payouts via Stripe."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="container mt-8 grid gap-4 md:max-w-2xl">
        <Card>
          <CardContent className="grid gap-2">
            <Label>Full name</Label>
            <Input placeholder="Your name" {...register("fullName")} />
            <FormFieldError message={errors.fullName?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
            <FormFieldError message={errors.email?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <Label>What do you teach?</Label>
            <Input placeholder="e.g., Day trading, Valorant coaching" {...register("topic")} />
            <FormFieldError message={errors.topic?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <Label>Proof links</Label>
            <Textarea placeholder="Portfolio, ranks, results, testimonials…" {...register("proofLinks")} />
            <FormFieldError message={errors.proofLinks?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <Label>What will you offer?</Label>
              <Select {...register("offerType")}>
                <option value="ACCESS">ACCESS (digital assets)</option>
                <option value="TIME">TIME (live sessions)</option>
                <option value="BOTH">Both</option>
              </Select>
              <FormFieldError message={errors.offerType?.message} />
            </div>

            {offerType !== "TIME" && (
              <div className="grid gap-2">
                <Label>ACCESS price (USD)</Label>
                <Input placeholder="e.g., 20" inputMode="decimal" {...register("price")} />
                <FormFieldError message={errors.price?.message} />
              </div>
            )}

            {offerType !== "ACCESS" && (
              <div className="grid gap-2">
                <Label>TIME hourly rate (USD)</Label>
                <Input placeholder="e.g., 30" inputMode="decimal" {...register("hourlyRate")} />
                <FormFieldError message={errors.hourlyRate?.message} />
              </div>
            )}
          </CardContent>
        </Card>

        {serverError && <p className="text-rose-300">{serverError}</p>}
        {sent && <p className="text-emerald-300">Application received! We’ll email you once reviewed.</p>}

        <Button type="submit" disabled={isSubmitting}>
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
