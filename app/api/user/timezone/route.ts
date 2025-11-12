import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const timezoneSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
});

/**
 * GET /api/user/timezone
 * Get current user's timezone preference
 */
export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { timezone: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: { timezone: user.timezone },
    });
  } catch (error) {
    console.error("Failed to get user timezone:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to get timezone" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/timezone
 * Update user's timezone preference
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = timezoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid timezone", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { timezone } = validation.data;

    const user = await db.user.update({
      where: { email },
      data: { timezone },
      select: { id: true, timezone: true },
    });

    return NextResponse.json({
      ok: true,
      data: { timezone: user.timezone },
    });
  } catch (error) {
    console.error("Failed to update user timezone:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update timezone" },
      { status: 500 }
    );
  }
}
