// app/api/mentor/subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const subscriptionPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  interval: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
  price: z.number().min(1, "Price must be greater than 0"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  isActive: z.boolean(),
});

const subscriptionPlansSchema = z.object({
  plans: z.array(subscriptionPlanSchema),
});

/**
 * GET /api/mentor/subscriptions
 * Get all subscription plans for the current mentor
 */
export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get mentor profile
    const mentor = await db.mentor.findFirst({
      where: { user: { email } },
      include: {
        subscriptionPlans: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!mentor) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        plans: mentor.subscriptionPlans,
      },
    });
  } catch (error) {
    console.error("[api/mentor/subscriptions] GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mentor/subscriptions
 * Create or update subscription plans for the current mentor
 */
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

    // Check if Stripe is connected
    if (!mentor.stripeOnboarded || !mentor.stripeConnectId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please connect your Stripe account before creating subscription plans"
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validation = subscriptionPlansSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { plans } = validation.data;

    // Process each plan
    const savedPlans = [];

    for (const plan of plans) {
      if (plan.id) {
        // Update existing plan
        const updated = await db.subscriptionPlan.update({
          where: { id: plan.id },
          data: {
            name: plan.name,
            description: plan.description || null,
            interval: plan.interval,
            price: plan.price,
            features: plan.features,
            isActive: plan.isActive,
          },
        });
        savedPlans.push(updated);
      } else {
        // Create new plan
        const created = await db.subscriptionPlan.create({
          data: {
            mentorId: mentor.id,
            name: plan.name,
            description: plan.description || null,
            interval: plan.interval,
            price: plan.price,
            features: plan.features,
            isActive: plan.isActive,
          },
        });
        savedPlans.push(created);
      }
    }

    console.log(`[api/mentor/subscriptions] Saved ${savedPlans.length} plans for mentor ${mentor.id}`);

    return NextResponse.json({
      ok: true,
      data: {
        plans: savedPlans,
      },
    });
  } catch (error) {
    console.error("[api/mentor/subscriptions] POST error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save subscription plans" },
      { status: 500 }
    );
  }
}
