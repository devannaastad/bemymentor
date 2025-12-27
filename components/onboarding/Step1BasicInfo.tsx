"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import FormFieldError from "@/components/common/FormFieldError";
import { MentorCategory } from "@prisma/client";

interface Step1BasicInfoProps {
  initialData?: {
    name?: string;
    category?: MentorCategory;
    tagline?: string;
  };
  onNext: (data: {
    name: string;
    category: MentorCategory;
    tagline: string;
  }) => void;
}

const CATEGORIES = [
  { value: "trading", label: "Trading & Finance" },
  { value: "gaming", label: "Gaming & Esports" },
  { value: "design", label: "Design & Creative" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "languages", label: "Languages" },
  { value: "career", label: "Career & Professional" },
];

export default function Step1BasicInfo({
  initialData,
  onNext,
}: Step1BasicInfoProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState<MentorCategory | "">(
    initialData?.category || ""
  );
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    if (!tagline.trim()) {
      setError("Tagline is required");
      return;
    }

    if (tagline.length < 10) {
      setError("Tagline must be at least 10 characters");
      return;
    }

    if (tagline.length > 100) {
      setError("Tagline must be less than 100 characters");
      return;
    }

    onNext({
      name: name.trim(),
      category: category as MentorCategory,
      tagline: tagline.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
        <p className="text-white/60">
          Let&apos;s start with the basics. This is how you&apos;ll appear to students.
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
            Your Name *
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            maxLength={50}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-white/80 mb-2">
            Category *
          </label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as MentorCategory)}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Tagline */}
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-white/80 mb-2">
            Tagline *
          </label>
          <Input
            id="tagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g., Professional day trader with 10+ years of experience"
            maxLength={100}
          />
          <p className="text-xs text-white/40 mt-1">
            {tagline.length}/100 characters - Make it catchy and descriptive!
          </p>
        </div>
      </div>

      {error && <FormFieldError error={error} />}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="lg">
          Continue
        </Button>
      </div>
    </form>
  );
}
