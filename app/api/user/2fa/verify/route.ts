// app/api/user/2fa/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { authenticator } from "otplib";
import { z } from "zod";

const VerifySchema = z.object({
  secret: z.string(),
  token: z.string().length(6),
  backupCodes: z.array(z.string()),
});

/**
 * POST /api/user/2fa/verify
 * Verify and enable 2FA
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const { secret, token, backupCodes } = parsed.data;

    // Verify the token
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Save the secret and backup codes
    await db.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: JSON.stringify(backupCodes),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "2FA enabled successfully",
    });
  } catch (err) {
    console.error("[api/user/2fa/verify] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
