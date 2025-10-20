// components/settings/ProfileForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/schemas/settings";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Label from "@/components/common/Label";
import FormFieldError from "@/components/common/FormFieldError";
import { useRouter } from "next/navigation";
import { toast } from "@/components/common/Toast";

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      toast("Profile updated successfully", "success");
      router.refresh();
    } catch (err) {
      console.error("[ProfileForm] Submit failed:", err);
      toast("Failed to update profile", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Your name"
        />
        {errors.name?.message && <FormFieldError error={errors.name.message} />}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email || ""}
          disabled
          className="opacity-50 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-white/50">
          Email cannot be changed. Contact support if needed.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!isDirty || isSubmitting}
          variant="primary"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        {isDirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.refresh()}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}