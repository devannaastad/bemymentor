import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session || !isAdmin(session.user?.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mentorId } = body;

    if (!mentorId) {
      return NextResponse.json({ error: "Missing mentorId" }, { status: 400 });
    }

    // Delete the mentor (cascade will handle related records)
    await db.mentor.delete({
      where: { id: mentorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting mentor:", error);
    return NextResponse.json({ error: "Failed to delete mentor" }, { status: 500 });
  }
}
