// lib/utils/categories.ts
import { MentorCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<MentorCategory, string> = {
  GAMING_ESPORTS: "Gaming & Esports",
  TRADING_INVESTING: "Trading & Investing",
  STREAMING_CONTENT: "Streaming & Content",
  YOUTUBE_PRODUCTION: "YouTube Production",
};

export const CATEGORY_DESCRIPTIONS: Record<MentorCategory, string> = {
  GAMING_ESPORTS: "Skill coaching, strategy, competitive prep",
  TRADING_INVESTING: "Market education, risk management",
  STREAMING_CONTENT: "Twitch/YouTube growth, audience retention",
  YOUTUBE_PRODUCTION: "Filmmaking, editing, branding",
};

export const CATEGORY_ICONS: Record<MentorCategory, string> = {
  GAMING_ESPORTS: "🎮",
  TRADING_INVESTING: "💸",
  STREAMING_CONTENT: "📹",
  YOUTUBE_PRODUCTION: "🎬",
};

export function getCategoryLabel(category: MentorCategory): string {
  return CATEGORY_LABELS[category];
}

export function getCategoryDescription(category: MentorCategory): string {
  return CATEGORY_DESCRIPTIONS[category];
}

export function getCategoryIcon(category: MentorCategory): string {
  return CATEGORY_ICONS[category];
}
