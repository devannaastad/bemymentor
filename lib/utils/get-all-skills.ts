// lib/utils/get-all-skills.ts

/**
 * Predefined skill categories based on mentor categories.
 * This provides a curated list of common skills for filtering.
 */
export const SKILL_CATEGORIES = {
  trading: [
    "Cryptocurrency",
    "Bitcoin",
    "Technical Analysis",
    "Risk Management",
    "Day Trading",
    "Swing Trading",
    "Options Trading",
    "Spreads",
    "Volatility Trading",
    "Institutional Trading",
    "Portfolio Management",
  ],
  gaming: [
    "Valorant",
    "FPS Games",
    "Aim Training",
    "Game Sense",
    "Crosshair Placement",
    "Team Strategy",
    "MOBA",
    "League of Legends",
    "Dota",
    "CS:GO",
  ],
  design: [
    "UI/UX Design",
    "Figma",
    "Design Systems",
    "User Research",
    "Prototyping",
    "Accessibility",
    "Adobe XD",
    "Sketch",
    "Web Design",
    "Mobile Design",
  ],
  fitness: [
    "Weight Loss",
    "Muscle Building",
    "Nutrition",
    "Meal Prep",
    "Strength Training",
    "Cardio",
    "Bodybuilding",
    "Powerlifting",
    "CrossFit",
    "Yoga",
  ],
  languages: [
    "Spanish",
    "Conversation",
    "Grammar",
    "DELE Exam",
    "Business Spanish",
    "Pronunciation",
    "French",
    "German",
    "Japanese",
    "Chinese",
  ],
  career: [
    "Resume Review",
    "Interview Prep",
    "Salary Negotiation",
    "Career Transition",
    "FAANG Interview",
    "LinkedIn Optimization",
    "Networking",
    "Personal Branding",
    "Leadership",
    "Management",
  ],
  ecommerce: [
    "Shopify",
    "Amazon FBA",
    "Dropshipping",
    "Product Sourcing",
    "Facebook Ads",
    "Email Marketing",
    "Product Photography",
    "Customer Service",
    "Supply Chain",
    "Conversion Optimization",
  ],
  agencies: [
    "Client Acquisition",
    "Agency Scaling",
    "Project Management",
    "Team Building",
    "SEO Services",
    "Social Media Marketing",
    "Cold Outreach",
    "Agency Operations",
    "Pricing Strategy",
    "Client Retention",
  ],
} as const;

/**
 * Get all unique skills across all categories
 */
export function getAllSkills(): string[] {
  const allSkills = new Set<string>();

  for (const skills of Object.values(SKILL_CATEGORIES)) {
    skills.forEach(skill => allSkills.add(skill));
  }

  return Array.from(allSkills).sort();
}

/**
 * Get skills for a specific category
 */
export function getSkillsByCategory(category: keyof typeof SKILL_CATEGORIES): string[] {
  return [...(SKILL_CATEGORIES[category] ?? [])];
}

/**
 * Popular skills to show as quick filters
 */
export const POPULAR_SKILLS = [
  "Cryptocurrency",
  "Valorant",
  "UI/UX Design",
  "Weight Loss",
  "Spanish",
  "FAANG Interview",
  "Bitcoin",
  "FPS Games",
  "Figma",
  "Nutrition",
  "Shopify",
  "Amazon FBA",
  "Client Acquisition",
  "Agency Scaling",
] as const;
