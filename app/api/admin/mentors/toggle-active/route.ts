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
    const { mentorId, isActive } = body;

    if (!mentorId || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.mentor.update({
      where: { id: mentorId },
      data: {
        isActive,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling mentor active status:", error);
    return NextResponse.json({ error: "Failed to update mentor status" }, { status: 500 });
  }
}
