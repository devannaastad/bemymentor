// app/api/saved/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Mentor } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // 🔧 never prerender this API

export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Single indexed lookup for saved mentor IDs
    const saved = await db.savedMentor.findMany({
      where: { user: { email } },
      select: { mentorId: true },
    });

    if (saved.length === 0) {
      return NextResponse.json(
        { ok: true, data: [] as Mentor[] },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const ids = saved.map((s) => s.mentorId);

    // One IN() query for mentors
    const mentors = await db.mentor.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { ok: true, data: mentors },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/saved] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
