// app/api/mentor/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get the mentor profile for this user
    const mentor = await db.mentor.findUnique({
      where: { userId: session.user.id },
    });

    if (!mentor) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Update the mentor profile
    const updatedMentor = await db.mentor.update({
      where: { id: mentor.id },
      data: {
        accessPassWelcome: body.accessPassWelcome,
        accessPassLinks: body.accessPassLinks,
        videoIntro: body.videoIntro,
        // Add other fields as needed
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: updatedMentor,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[api/mentor/profile] PUT failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
