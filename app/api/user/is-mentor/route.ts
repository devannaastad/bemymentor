// app/api/user/is-mentor/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/user/is-mentor
 * Check if the current user has a mentor profile
 */
export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: true, data: { isMentor: false } });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        mentorProfile: {
          select: { id: true },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: { isMentor: !!user?.mentorProfile },
    });
  } catch (error) {
    console.error("Failed to check mentor status:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to check mentor status" },
      { status: 500 }
    );
  }
}
