// lib/onboarding.ts
import { Mentor } from "@prisma/client";

/**
 * Onboarding steps:
 * 0: Not started
 * 1: Basic Info (name, category, tagline)
 * 2: Profile Details (bio, profile image, social links)
 * 3: Pricing & Offers (offerType, prices)
 * 4: Availability Setup (for TIME or BOTH offers)
 * 5: Stripe Connect Setup
 */

export interface OnboardingStepInfo {
  step: number;
  title: string;
  description: string;
  isComplete: boolean;
}

export function calculateProfileCompleteness(mentor: Partial<Mentor>): number {
  let score = 0;
  const weights = {
    name: 10,
    category: 10,
    tagline: 15,
    bio: 15,
    profileImage: 15,
    socialLinks: 10,
    offerType: 10,
    pricing: 10, // accessPrice or hourlyRate
    stripeOnboarded: 15,
  };

  if (mentor.name) score += weights.name;
  if (mentor.category) score += weights.category;
  if (mentor.tagline) score += weights.tagline;
  if (mentor.bio && mentor.bio.length >= 50) score += weights.bio;
  if (mentor.profileImage) score += weights.profileImage;
  if (mentor.socialLinks) score += weights.socialLinks;
  if (mentor.offerType) score += weights.offerType;
  if (mentor.accessPrice || mentor.hourlyRate) score += weights.pricing;
  if (mentor.stripeOnboarded) score += weights.stripeOnboarded;

  return Math.min(100, score);
}

export function getOnboardingSteps(mentor: Partial<Mentor>): OnboardingStepInfo[] {
  return [
    {
      step: 1,
      title: "Basic Information",
      description: "Set up your name, category, and tagline",
      isComplete: !!(mentor.name && mentor.category && mentor.tagline),
    },
    {
      step: 2,
      title: "Profile Details",
      description: "Add your bio, profile image, and social links",
      isComplete: !!(
        mentor.bio &&
        mentor.bio.length >= 50 &&
        mentor.profileImage
      ),
    },
    {
      step: 3,
      title: "Pricing & Offers",
      description: "Choose what you're offering and set your prices",
      isComplete: !!(
        mentor.offerType &&
        (mentor.accessPrice || mentor.hourlyRate)
      ),
    },
    {
      step: 4,
      title: "Availability",
      description: "Set your weekly availability schedule",
      isComplete: mentor.offerType === "ACCESS" || false, // Will check availability records
    },
    {
      step: 5,
      title: "Payment Setup",
      description: "Connect your Stripe account to receive payments",
      isComplete: !!mentor.stripeOnboarded,
    },
  ];
}

export function getCurrentOnboardingStep(mentor: Partial<Mentor>): number {
  const steps = getOnboardingSteps(mentor);

  // Find the first incomplete step
  for (let i = 0; i < steps.length; i++) {
    if (!steps[i].isComplete) {
      return steps[i].step;
    }
  }

  // All steps complete
  return 6; // Beyond last step
}

export function isOnboardingComplete(mentor: Partial<Mentor>): boolean {
  const steps = getOnboardingSteps(mentor);
  return steps.every(step => step.isComplete);
}
