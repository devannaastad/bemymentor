// app/api/user/2fa/setup/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";

// Generate backup codes
function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(
      crypto.randomBytes(4).toString("hex").toUpperCase().match(/.{1,4}/g)!.join("-")
    );
  }
  return codes;
}

/**
 * POST /api/user/2fa/setup
 * Generate a new 2FA secret and QR code
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Generate a new secret
    const secret = authenticator.generateSecret();

    // Generate OTP Auth URL
    const otpauthUrl = authenticator.keyuri(
      user.email || "user",
      "BeMyMentor",
      secret
    );

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Return secret and QR code (don't save yet - user must verify first)
    return NextResponse.json({
      ok: true,
      data: {
        secret,
        qrCode: qrCodeDataUrl,
        backupCodes,
      },
    });
  } catch (err) {
    console.error("[api/user/2fa/setup] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
