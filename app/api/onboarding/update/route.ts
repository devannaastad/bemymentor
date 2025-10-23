// app/api/onboarding/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { MentorCategory, OfferType } from "@prisma/client";
import { calculateProfileCompleteness, getCurrentOnboardingStep, isOnboardingComplete } from "@/lib/onboarding";

const UpdateOnboardingSchema = z.object({
  step: z.number().int().min(1).max(5),
  data: z.record(z.any()),
});

export async function POST(req: NextRequest) {
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = UpdateOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const { step, data } = parsed.data;

    // Get existing mentor profile or create new one
    let mentor = await db.mentor.findUnique({
      where: { userId: user.id },
    });

    // Prepare update data based on step
    let updateData: Record<string, unknown> = {};

    switch (step) {
      case 1:
        // Basic Info
        updateData = {
          name: data.name,
          category: data.category as MentorCategory,
          tagline: data.tagline,
        };
        break;

      case 2:
        // Profile Details
        updateData = {
          bio: data.bio,
          profileImage: data.profileImage,
          socialLinks: data.socialLinks,
        };
        break;

      case 3:
        // Pricing & Offers
        updateData = {
          offerType: data.offerType as OfferType,
          accessPrice: data.accessPrice,
          hourlyRate: data.hourlyRate,
        };
        break;

      case 4:
        // Availability (placeholder for now)
        updateData = {};
        break;

      case 5:
        // Payment setup (handled by Stripe webhook)
        updateData = {};
        break;

      default:
        return NextResponse.json(
          { ok: false, error: "Invalid step" },
          { status: 400 }
        );
    }

    if (mentor) {
      // Update existing mentor
      mentor = await db.mentor.update({
        where: { id: mentor.id },
        data: updateData,
      });
    } else {
      // Create new mentor profile (should only happen on step 1)
      if (step !== 1) {
        return NextResponse.json(
          { ok: false, error: "Must complete step 1 first" },
          { status: 400 }
        );
      }

      mentor = await db.mentor.create({
        data: {
          userId: user.id,
          ...updateData,
        },
      });
    }

    // Recalculate onboarding progress
    const profileCompleteness = calculateProfileCompleteness(mentor);
    const currentStep = getCurrentOnboardingStep(mentor);
    const onboardingComplete = isOnboardingComplete(mentor);

    // Update progress tracking
    await db.mentor.update({
      where: { id: mentor.id },
      data: {
        onboardingStep: currentStep,
        profileCompleteness,
        onboardingComplete,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        mentorId: mentor.id,
        currentStep,
        profileCompleteness,
        onboardingComplete,
      },
    });
  } catch (error) {
    console.error("Onboarding update error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
