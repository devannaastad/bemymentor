// app/api/mentor/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get the mentor profile for this user
    const mentor = await db.mentor.findUnique({
      where: { userId: session.user.id },
    });

    if (!mentor) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Basic Info fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage;
    if (body.skills !== undefined) {
      // Convert comma-separated string to array
      updateData.skills = body.skills
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }
    if (body.offerType !== undefined) updateData.offerType = body.offerType;
    if (body.accessPrice !== undefined) {
      // Convert dollars to cents
      updateData.accessPrice = Math.round(body.accessPrice * 100);
    }
    if (body.hourlyRate !== undefined) {
      // Convert dollars to cents
      updateData.hourlyRate = Math.round(body.hourlyRate * 100);
    }
    if (body.socialLinks !== undefined) updateData.socialLinks = body.socialLinks;

    // Access Pass Content fields
    if (body.accessPassWelcome !== undefined) updateData.accessPassWelcome = body.accessPassWelcome;
    if (body.accessPassLinks !== undefined) updateData.accessPassLinks = body.accessPassLinks;

    // Video Intro field
    if (body.videoIntro !== undefined) updateData.videoIntro = body.videoIntro;

    // Portfolio field
    if (body.portfolio !== undefined) updateData.portfolio = body.portfolio;

    // Update the mentor profile
    const updatedMentor = await db.mentor.update({
      where: { id: mentor.id },
      data: updateData,
    });

    return NextResponse.json(
      {
        ok: true,
        data: updatedMentor,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[api/mentor/profile] PUT failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
