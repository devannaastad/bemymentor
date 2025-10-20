// app/api/user/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/schemas/settings";

export const runtime = "nodejs";

/**
 * GET /api/user/settings
 * Get current user's settings
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
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { ok: true, data: user },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/user/settings] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/user/settings
 * Update user profile settings
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid data", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, image } = validation.data;

    // Build update data (only include defined fields)
    const updateData: { name?: string; image?: string | null } = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image || null;

    const user = await db.user.update({
      where: { email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    console.log("[api/user/settings] Updated user:", user.id);

    return NextResponse.json(
      { ok: true, data: user },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/user/settings] PATCH failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}