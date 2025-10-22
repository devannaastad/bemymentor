// app/api/user/2fa/disable/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const DisableSchema = z.object({
  password: z.string().min(1),
});

/**
 * POST /api/user/2fa/disable
 * Disable 2FA (requires password confirmation)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = DisableSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const { password } = parsed.data;

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Verify password
    if (user.password) {
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) {
        return NextResponse.json(
          { ok: false, error: "Incorrect password" },
          { status: 400 }
        );
      }
    } else {
      // OAuth-only user - can't disable 2FA with password
      return NextResponse.json(
        { ok: false, error: "Cannot verify identity. Please contact support." },
        { status: 400 }
      );
    }

    // Disable 2FA
    await db.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "2FA disabled successfully",
    });
  } catch (err) {
    console.error("[api/user/2fa/disable] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
