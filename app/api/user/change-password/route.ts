// app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

/**
 * POST /api/user/change-password
 * Change user's password
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user with password
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has a password (not OAuth-only account)
    if (!user.password) {
      return NextResponse.json(
        { ok: false, error: "This account uses OAuth sign-in. Password change is not available." },
        { status: 400 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { ok: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return NextResponse.json(
        { ok: false, error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`[api/user/change-password] Password changed for user: ${email}`);

    return NextResponse.json({
      ok: true,
      data: { message: "Password changed successfully" },
    });
  } catch (error) {
    console.error("[api/user/change-password] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}
