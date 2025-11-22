import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete all notifications for the user
    await db.notification.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to clear notifications" },
      { status: 500 }
    );
  }
}
