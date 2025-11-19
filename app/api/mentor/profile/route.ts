// app/api/mentor/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
      const priceInDollars = parseFloat(body.accessPrice);
      // Validate minimum price (Stripe requires at least $0.50)
      if (priceInDollars < 0.50) {
        return NextResponse.json(
          { ok: false, error: "Access price must be at least $0.50 (Stripe requirement)" },
          { status: 400 }
        );
      }
      // Convert dollars to cents
      updateData.accessPrice = Math.round(priceInDollars * 100);
    }
    if (body.hourlyRate !== undefined) {
      const rateInDollars = parseFloat(body.hourlyRate);
      // Validate minimum rate (Stripe requires at least $0.50)
      if (rateInDollars < 0.50) {
        return NextResponse.json(
          { ok: false, error: "Hourly rate must be at least $0.50 (Stripe requirement)" },
          { status: 400 }
        );
      }
      // Convert dollars to cents
      updateData.hourlyRate = Math.round(rateInDollars * 100);
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

    // Revalidate catalog and mentor profile pages to show updated data immediately
    revalidatePath("/catalog");
    revalidatePath(`/mentors/${mentor.id}`);

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
