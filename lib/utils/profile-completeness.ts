// lib/utils/profile-completeness.ts
import type { Mentor } from "@prisma/client";

export interface ProfileCompletenessItem {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  link?: string;
  weight: number;
}

export type ProfileCompletenessResult = {
  percentage: number;
  missingFields: string[];
  completedFields: string[];
  items: ProfileCompletenessItem[];
};

export function calculateProfileCompleteness(
  mentor: Partial<Mentor>
): ProfileCompletenessResult {
  const items: ProfileCompletenessItem[] = [
    {
      key: "name",
      label: "Name",
      description: "Your display name",
      completed: !!(mentor.name && mentor.name.trim().length > 0),
      weight: 10,
    },
    {
      key: "tagline",
      label: "Tagline",
      description: "Short headline describing your expertise",
      completed: !!(mentor.tagline && mentor.tagline.trim().length > 0),
      weight: 10,
    },
    {
      key: "bio",
      label: "Bio",
      description: "Detailed bio (at least 100 characters recommended)",
      completed: !!(mentor.bio && mentor.bio.trim().length >= 100),
      weight: 15,
    },
    {
      key: "profileImage",
      label: "Profile Photo",
      description: "Professional profile picture",
      completed: !!mentor.profileImage,
      weight: 10,
    },
    {
      key: "category",
      label: "Category",
      description: "Your mentoring category",
      completed: !!mentor.category,
      weight: 10,
    },
    {
      key: "socialLinks",
      label: "Social Links",
      description: "Add at least one social profile",
      completed: !!(
        mentor.socialLinks &&
        typeof mentor.socialLinks === "object" &&
        Object.keys(mentor.socialLinks).length > 0
      ),
      weight: 5,
    },
    {
      key: "stripe",
      label: "Payment Setup",
      description: "Connect Stripe to receive payments",
      completed: !!mentor.stripeOnboarded,
      link: "/api/stripe/connect",
      weight: 20,
    },
    {
      key: "timezone",
      label: "Timezone",
      description: "Set your timezone for scheduling",
      completed: !!mentor.timezone,
      link: "/mentor-settings",
      weight: 5,
    },
  ];

  // Add pricing fields based on offer type
  if (mentor.offerType === "ACCESS" || mentor.offerType === "BOTH") {
    items.push({
      key: "accessPrice",
      label: "Access Price",
      description: "Set your ACCESS pass price",
      completed: !!(mentor.accessPrice && mentor.accessPrice > 0),
      link: "/mentor-settings",
      weight: 7.5,
    });
  }

  if (mentor.offerType === "TIME" || mentor.offerType === "BOTH") {
    items.push({
      key: "hourlyRate",
      label: "Hourly Rate",
      description: "Set your hourly coaching rate",
      completed: !!(mentor.hourlyRate && mentor.hourlyRate > 0),
      link: "/mentor-settings",
      weight: 7.5,
    });
  }

  const completedFields: string[] = [];
  const missingFields: string[] = [];

  for (const item of items) {
    if (item.completed) {
      completedFields.push(item.label);
    } else {
      missingFields.push(item.label);
    }
  }

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = items
    .filter((item) => item.completed)
    .reduce((sum, item) => sum + item.weight, 0);

  const percentage = Math.round((completedWeight / totalWeight) * 100);

  return {
    percentage,
    completedFields,
    missingFields,
    items,
  };
}

/**
 * Get a color class based on completion percentage
 */
export function getCompletenessColor(percentage: number): string {
  if (percentage >= 80) return "text-emerald-400";
  if (percentage >= 50) return "text-amber-400";
  return "text-rose-400";
}

/**
 * Get a progress bar color based on completion percentage
 */
export function getCompletenessProgressColor(percentage: number): string {
  if (percentage >= 80) return "bg-emerald-500";
  if (percentage >= 50) return "bg-amber-500";
  return "bg-rose-500";
}
