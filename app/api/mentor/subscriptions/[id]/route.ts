// app/api/mentor/subscriptions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

type Params = {
  id: string;
};

const subscriptionPageSchema = z.object({
  pageContent: z.string().nullable().optional(),
  pageVideos: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    description: z.string().optional(),
  })).nullable().optional(),
  pageImages: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
  })).nullable().optional(),
  accessLinks: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
  })).nullable().optional(),
});

/**
 * PATCH /api/mentor/subscriptions/[id]
 * Update subscription plan page content
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: planId } = await context.params;

    // Verify the user owns this subscription plan
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

    // Verify the plan belongs to this mentor
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId },
      select: { mentorId: true },
    });

    if (!plan || plan.mentorId !== user.mentorProfile.id) {
      return NextResponse.json(
        { ok: false, error: "Subscription plan not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = subscriptionPageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { pageContent, pageVideos, pageImages, accessLinks } = validation.data;

    // Update subscription plan
    await db.subscriptionPlan.update({
      where: { id: planId },
      data: {
        pageContent,
        pageVideos: pageVideos || undefined,
        pageImages: pageImages || undefined,
        accessLinks: accessLinks || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/mentor/subscriptions/[id]] PATCH error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update subscription page content" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mentor/subscriptions/[id]
 * Delete a subscription plan
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Get mentor profile
    const mentor = await db.mentor.findFirst({
      where: { user: { email } },
    });

    if (!mentor) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    // Find the plan
    const plan = await db.subscriptionPlan.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: {
            status: "ACTIVE",
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { ok: false, error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // Verify the plan belongs to this mentor
    if (plan.mentorId !== mentor.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if there are active subscriptions
    if (plan.subscriptions.length > 0) {
      // Mark as inactive instead of deleting
      await db.subscriptionPlan.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        ok: true,
        data: {
          message: "Plan deactivated (active subscriptions exist)",
        },
      });
    }

    // No active subscriptions, safe to delete
    await db.subscriptionPlan.delete({
      where: { id },
    });

    console.log(`[api/mentor/subscriptions] Deleted plan ${id} for mentor ${mentor.id}`);

    return NextResponse.json({
      ok: true,
      data: {
        message: "Subscription plan deleted",
      },
    });
  } catch (error) {
    console.error("[api/mentor/subscriptions/[id]] DELETE error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete subscription plan" },
      { status: 500 }
    );
  }
}
