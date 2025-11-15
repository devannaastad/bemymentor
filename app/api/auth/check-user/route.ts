// app/api/auth/check-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ hasOAuthOnly: false, has2FA: false });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ exists: false, hasOAuthOnly: false, has2FA: false });
    }

    // User exists with OAuth but no password
    const hasOAuthOnly = user.accounts.length > 0 && !user.password;
    const has2FA = user.twoFactorEnabled;

    return NextResponse.json({ exists: true, hasOAuthOnly, has2FA });
  } catch {
    return NextResponse.json({ exists: false, hasOAuthOnly: false, has2FA: false });
  }
}
