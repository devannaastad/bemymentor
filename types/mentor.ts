// types/mentor.ts
import { Mentor } from "@prisma/client";

export type MentorWithRelations = Mentor;

export interface AccessPassLink {
  type: "discord" | "telegram" | "slack" | "link" | "document";
  title: string;
  url: string;
  description?: string;
}
