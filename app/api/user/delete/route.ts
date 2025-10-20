// app/api/user/delete/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * DELETE /api/user/delete
 * Permanently delete the current user's account and all associated data
 */
export async function DELETE() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Delete the user (cascade will handle related data)
    // Cascade deletes will handle:
    // - Account (OAuth connections)
    // - Session (active sessions)
    // - SavedMentor (saved mentors)
    // - Booking (bookings as a learner)
    // - Mentor (if they are a mentor, which cascades to their bookings)
    // - Application (not cascade, but we'll delete manually to be safe)
    
    await db.$transaction([
      // Explicitly delete applications (not set up with cascade in schema)
      db.application.deleteMany({
        where: { email },
      }),
      
      // Delete the user (cascades handle the rest)
      db.user.delete({
        where: { id: user.id },
      }),
    ]);

    console.log("[api/user/delete] Deleted user:", user.id);

    return NextResponse.json(
      { ok: true, message: "Account deleted successfully" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/user/delete] DELETE failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}