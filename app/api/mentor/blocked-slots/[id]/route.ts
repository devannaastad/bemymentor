// app/api/mentor/blocked-slots/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type Params = { id: string };

/**
 * DELETE /api/mentor/blocked-slots/[id]
 * Remove a blocked slot
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { mentorProfile: true },
    });

    if (!user?.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Not a mentor" },
        { status: 403 }
      );
    }

    const { id: slotId } = await context.params;

    // Verify ownership
    const slot = await db.blockedSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.mentorId !== user.mentorProfile.id) {
      return NextResponse.json(
        { ok: false, error: "Blocked slot not found" },
        { status: 404 }
      );
    }

    await db.blockedSlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({
      ok: true,
      message: "Blocked slot deleted",
    });
  } catch (err) {
    console.error("[api/mentor/blocked-slots/[id]] DELETE failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
