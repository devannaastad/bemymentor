// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (existingUser) {
      // Check if user signed up with OAuth provider
      const oauthProvider = existingUser.accounts.find(
        (acc) => acc.provider === "google"
      );

      if (oauthProvider) {
        return NextResponse.json(
          {
            ok: false,
            error: "This email is already registered with Google. Please sign in with Google instead."
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("[api/auth/signup] POST failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
