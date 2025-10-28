// app/api/mentor-setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { mentorSetupSchema } from "@/lib/schemas/mentor-setup";
import { MentorCategory, Prisma } from "@prisma/client";

export const runtime = "nodejs";

/**
 * POST /api/mentor-setup
 * Creates a Mentor profile from an approved application
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        mentorProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Check if they already have a mentor profile
    if (user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "You already have a mentor profile" },
        { status: 400 }
      );
    }

    // Find approved application
    const approvedApp = await db.application.findFirst({
      where: {
        email,
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!approvedApp) {
      return NextResponse.json(
        { ok: false, error: "No approved application found" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = mentorSetupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { bio, profileImage, twitterUrl, linkedinUrl, websiteUrl } = validation.data;

    // Determine category from topic
    const category = inferCategory(approvedApp.topic);

    // Build social links object (only include non-empty values)
    const socialLinksData: Record<string, string> = {};
    if (twitterUrl && twitterUrl.trim()) socialLinksData.twitter = twitterUrl.trim();
    if (linkedinUrl && linkedinUrl.trim()) socialLinksData.linkedin = linkedinUrl.trim();
    if (websiteUrl && websiteUrl.trim()) socialLinksData.website = websiteUrl.trim();

    // Create Mentor record
    const mentor = await db.mentor.create({
      data: {
        userId: user.id,
        name: approvedApp.fullName,
        category,
        tagline: approvedApp.topic,
        bio,
        profileImage: profileImage && profileImage.trim() ? profileImage.trim() : null,
        socialLinks: Object.keys(socialLinksData).length > 0 
          ? (socialLinksData as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        offerType: approvedApp.offerType,
        accessPrice: approvedApp.accessPrice,
        hourlyRate: approvedApp.hourlyRate,
        rating: 5.0,
        reviews: 0,
        badges: Prisma.JsonNull,
        isActive: true,
      },
    });

    console.log("[mentor-setup] Created mentor profile:", mentor.id);

    return NextResponse.json(
      { ok: true, mentorId: mentor.id },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/mentor-setup] Failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

function inferCategory(topic: string): MentorCategory {
  const lower = topic.toLowerCase();

  if (
    lower.includes("trading") ||
    lower.includes("stocks") ||
    lower.includes("crypto") ||
    lower.includes("forex") ||
    lower.includes("invest")
  ) {
    return "TRADING_INVESTING";
  }
  if (
    lower.includes("game") ||
    lower.includes("gaming") ||
    lower.includes("valorant") ||
    lower.includes("league") ||
    lower.includes("cs") ||
    lower.includes("esport") ||
    lower.includes("rocket")
  ) {
    return "GAMING_ESPORTS";
  }
  if (
    lower.includes("stream") ||
    lower.includes("twitch") ||
    lower.includes("content") ||
    lower.includes("youtube live")
  ) {
    return "STREAMING_CONTENT";
  }
  if (
    lower.includes("edit") ||
    lower.includes("video") ||
    lower.includes("youtube") ||
    lower.includes("thumbnail") ||
    lower.includes("production")
  ) {
    return "YOUTUBE_PRODUCTION";
  }

  return "STREAMING_CONTENT"; // default fallback
}