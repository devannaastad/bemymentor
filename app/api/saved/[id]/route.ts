// app/api/saved/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

/**
 * Save a mentor for the current user
 * POST /api/saved/:id
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const mentorId = params.id;
    if (!mentorId) return NextResponse.json({ ok: false, error: "Missing mentor id" }, { status: 400 });

    // Get user id from email (SavedMentor stores userId)
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    // Upsert avoids duplicates thanks to the composite unique on (userId, mentorId)
    await db.savedMentor.upsert({
      where: { userId_mentorId: { userId: user.id, mentorId } },
      update: {},
      create: { userId: user.id, mentorId },
    });

    // Revalidate Saved page so UI updates instantly
    revalidatePath("/saved");

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/saved/:id] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * Unsave a mentor for the current user
 * DELETE /api/saved/:id
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const mentorId = params.id;
    if (!mentorId) return NextResponse.json({ ok: false, error: "Missing mentor id" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    await db.savedMentor.deleteMany({
      where: { userId: user.id, mentorId },
    });

    revalidatePath("/saved");

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/saved/:id] DELETE failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
