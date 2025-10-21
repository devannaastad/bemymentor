// lib/utils/profile-completeness.ts
import type { Mentor } from "@prisma/client";

export type ProfileCompletenessResult = {
  percentage: number;
  missingFields: string[];
  completedFields: string[];
};

export function calculateProfileCompleteness(
  mentor: Partial<Mentor>
): ProfileCompletenessResult {
  const fields = [
    { key: "name", label: "Name", value: mentor.name },
    { key: "tagline", label: "Tagline", value: mentor.tagline },
    { key: "bio", label: "Bio", value: mentor.bio },
    { key: "profileImage", label: "Profile Image", value: mentor.profileImage },
    { key: "socialLinks", label: "Social Links", value: mentor.socialLinks },
    { key: "category", label: "Category", value: mentor.category },
    { key: "offerType", label: "Offer Type", value: mentor.offerType },
  ];

  // Add pricing fields based on offer type
  if (mentor.offerType === "ACCESS" || mentor.offerType === "BOTH") {
    fields.push({
      key: "accessPrice",
      label: "Access Price",
      value: mentor.accessPrice,
    });
  }

  if (mentor.offerType === "TIME" || mentor.offerType === "BOTH") {
    fields.push({
      key: "hourlyRate",
      label: "Hourly Rate",
      value: mentor.hourlyRate,
    });
  }

  const completedFields: string[] = [];
  const missingFields: string[] = [];

  for (const field of fields) {
    if (
      field.value !== null &&
      field.value !== undefined &&
      field.value !== ""
    ) {
      // Special check for socialLinks (should be a non-empty object)
      if (field.key === "socialLinks") {
        if (
          typeof field.value === "object" &&
          Object.keys(field.value).length > 0
        ) {
          completedFields.push(field.label);
        } else {
          missingFields.push(field.label);
        }
      } else {
        completedFields.push(field.label);
      }
    } else {
      missingFields.push(field.label);
    }
  }

  const percentage = Math.round(
    (completedFields.length / fields.length) * 100
  );

  return {
    percentage,
    completedFields,
    missingFields,
  };
}
