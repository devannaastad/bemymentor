// app/api/saved/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Mentor } from "@prisma/client";

export const runtime = "nodejs";
export const revalidate = 30;

export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get saved mentor IDs for this user using a relational filter on email
    const saved = await db.savedMentor.findMany({
      where: { user: { email } },
      select: { mentorId: true },
    });

    if (saved.length === 0) {
      return NextResponse.json(
        { ok: true, data: [] as Mentor[] },
        {
          status: 200,
          headers: { "Cache-Control": "public, max-age=15, s-maxage=30, stale-while-revalidate=60" },
        }
      );
    }

    const ids: string[] = saved.map((row) => row.mentorId);

    // Fetch all mentors in a single IN() query
    const mentors = await db.mentor.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { ok: true, data: mentors },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=15, s-maxage=30, stale-while-revalidate=60" },
      }
    );
  } catch (err) {
    console.error("[api/saved] GET failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
