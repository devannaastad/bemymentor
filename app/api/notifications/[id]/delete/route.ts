// app/api/notifications/[id]/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type Params = { id: string };

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify notification belongs to user
    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { ok: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the notification
    await db.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      ok: true,
      data: { message: "Notification deleted" },
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
