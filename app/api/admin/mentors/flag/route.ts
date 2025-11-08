import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !isAdmin(session.user?.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mentorId, reason } = body;

    if (!mentorId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.mentor.update({
      where: { id: mentorId },
      data: {
        flagged: true,
        flagReason: reason,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error flagging mentor:", error);
    return NextResponse.json({ error: "Failed to flag mentor" }, { status: 500 });
  }
}
