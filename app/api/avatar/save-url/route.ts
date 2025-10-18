// app/api/avatar/save-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";          // ✅ Prisma-friendly runtime
export const dynamic = "force-dynamic";   // ✅ do not prerender (depends on auth cookie)

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { url?: string };
    const url = body?.url?.trim();
    if (!url) {
      return NextResponse.json({ ok: false, error: "Missing url" }, { status: 400 });
    }

    // Update by email (no need for user.id in the session payload)
    await db.user.update({
      where: { email },
      data: { image: url },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[api/avatar/save-url] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
