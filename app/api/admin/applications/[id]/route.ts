// app/api/admin/applications/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { z } from "zod";
import type { Application, MentorCategory } from "@prisma/client";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  notes: z.string().optional(),
  reviewedBy: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    
    if (!isAdmin(email)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = updateSchema.parse(body);

    const application = await db.application.update({
      where: { id },
      data: {
        status: parsed.status,
        notes: parsed.notes,
        reviewedBy: parsed.reviewedBy || email || "admin",
        reviewedAt: parsed.status ? new Date() : undefined,
      },
    });

    if (parsed.status === "APPROVED") {
      await createMentorFromApplication(application);
    }

    return NextResponse.json({ ok: true, data: application });
  } catch (error) {
    console.error("[admin:update] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}

async function createMentorFromApplication(app: Application) {
  try {
    const existing = await db.mentor.findFirst({
      where: {
        name: app.fullName,
        category: inferCategory(app.topic),
      },
    });

    if (existing) {
      console.log("[admin:mentor] Already exists:", existing.id);
      return;
    }

    const mentor = await db.mentor.create({
      data: {
        name: app.fullName,
        category: inferCategory(app.topic),
        tagline: app.topic,
        rating: 5.0,
        reviews: 0,
        offerType: app.offerType,
        accessPrice: app.accessPrice,
        hourlyRate: app.hourlyRate,
        badges: ["New mentor"],
      },
    });

    console.log("[admin:mentor] Created:", mentor.id);
    return mentor;
  } catch (error) {
    console.error("[admin:mentor] Failed to create:", error);
  }
}

function inferCategory(topic: string): MentorCategory {
  const lower = topic.toLowerCase();
  
  if (lower.includes("trading") || lower.includes("stocks") || lower.includes("crypto")) {
    return "trading";
  }
  if (lower.includes("game") || lower.includes("valorant") || lower.includes("league") || lower.includes("cs")) {
    return "gaming";
  }
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui") || lower.includes("figma")) {
    return "design";
  }
  if (lower.includes("fitness") || lower.includes("workout") || lower.includes("gym")) {
    return "fitness";
  }
  if (lower.includes("language") || lower.includes("spanish") || lower.includes("french") || lower.includes("japanese")) {
    return "languages";
  }
  if (lower.includes("career") || lower.includes("resume") || lower.includes("interview")) {
    return "career";
  }
  
  return "career";
}