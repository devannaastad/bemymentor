// app/api/mentor/access-pass/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const accessPassSchema = z.object({
  accessPassWelcome: z.string().nullable().optional(),
  accessPassPageContent: z.string().nullable().optional(),
  accessPassLinks: z.array(z.object({
    type: z.string(),
    title: z.string(),
    url: z.string().url(),
    description: z.string().optional(),
  })).nullable().optional(),
  accessPassVideos: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    description: z.string().optional(),
  })).nullable().optional(),
  accessPassImages: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
  })).nullable().optional(),
});

/**
 * PATCH /api/mentor/access-pass
 * Update Access Pass page content
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { mentorProfile: true },
    });

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = accessPassSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { accessPassWelcome, accessPassPageContent, accessPassLinks, accessPassVideos, accessPassImages } = validation.data;

    // Update mentor profile
    await db.mentor.update({
      where: { id: user.mentorProfile.id },
      data: {
        accessPassWelcome,
        accessPassPageContent,
        accessPassLinks: accessPassLinks || undefined,
        accessPassVideos: accessPassVideos || undefined,
        accessPassImages: accessPassImages || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/mentor/access-pass] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update Access Pass content" },
      { status: 500 }
    );
  }
}
