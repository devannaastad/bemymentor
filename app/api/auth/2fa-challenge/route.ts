// app/api/auth/2fa-challenge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticator } from "otplib";
import bcrypt from "bcryptjs";
import { z } from "zod";

const ChallengeSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  token: z.string().length(6),
});

/**
 * POST /api/auth/2fa-challenge
 * Verify 2FA token during login
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChallengeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, token } = parsed.data;

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 400 }
      );
    }

    // Verify password first
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 400 }
      );
    }

    // Check if it's a backup code
    if (user.backupCodes) {
      const backupCodes = JSON.parse(user.backupCodes) as string[];
      const backupCodeIndex = backupCodes.indexOf(token);

      if (backupCodeIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(backupCodeIndex, 1);
        await db.user.update({
          where: { id: user.id },
          data: { backupCodes: JSON.stringify(backupCodes) },
        });

        return NextResponse.json({ ok: true, valid: true });
      }
    }

    // Verify TOTP token
    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid 2FA code" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, valid: true });
  } catch (err) {
    console.error("[api/auth/2fa-challenge] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
