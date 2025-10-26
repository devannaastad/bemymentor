// app/api/mentor/stripe-connect/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  createConnectAccount,
  createAccountLink,
  checkAccountOnboarding,
  createLoginLink,
} from "@/lib/stripe-connect";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { mentorProfile: true },
    });

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const mentor = user.mentorProfile;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Determine redirect URL based on whether mentor is already onboarded
    const isOnboardingComplete = mentor.onboardingComplete || mentor.profileCompleteness >= 80;
    const refreshUrl = isOnboardingComplete
      ? `${appUrl}/mentor-dashboard`
      : `${appUrl}/mentor/onboarding?step=5`;
    const returnUrl = isOnboardingComplete
      ? `${appUrl}/mentor-dashboard?stripe=success`
      : `${appUrl}/mentor/onboarding?step=5&success=true`;

    if (mentor.stripeConnectId) {
      const { onboarded, detailsSubmitted } = await checkAccountOnboarding(mentor.stripeConnectId);

      // If fully onboarded OR details submitted (basically done with onboarding), use login link
      if (onboarded || detailsSubmitted) {
        try {
          const loginLink = await createLoginLink(mentor.stripeConnectId);
          return NextResponse.json({
            ok: true,
            data: {
              url: loginLink.url,
              isOnboarded: true,
            },
          });
        } catch (loginError) {
          console.error("[stripe-connect] Login link error:", loginError);
          // If login link fails, fall through to try account link
        }
      }

      // Try to create account link for continuing onboarding
      try {
        const accountLink = await createAccountLink(
          mentor.stripeConnectId,
          refreshUrl,
          returnUrl
        );

        return NextResponse.json({
          ok: true,
          data: {
            url: accountLink.url,
            isOnboarded: false,
          },
        });
      } catch (linkError) {
        console.error("[stripe-connect] Account link error:", linkError);
        // If account link fails but they have an account, try login link as fallback
        const loginLink = await createLoginLink(mentor.stripeConnectId);
        return NextResponse.json({
          ok: true,
          data: {
            url: loginLink.url,
            isOnboarded: true,
          },
        });
      }
    }

    const account = await createConnectAccount(email, mentor.name);

    await db.mentor.update({
      where: { id: mentor.id },
      data: {
        stripeConnectId: account.id,
      },
    });

    const accountLink = await createAccountLink(
      account.id,
      refreshUrl,
      returnUrl
    );

    return NextResponse.json({
      ok: true,
      data: {
        url: accountLink.url,
        isOnboarded: false,
      },
    });
  } catch (error) {
    console.error("[stripe-connect] POST error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create Stripe Connect account" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { mentorProfile: true },
    });

    if (!user || !user.mentorProfile) {
      return NextResponse.json(
        { ok: false, error: "Mentor profile not found" },
        { status: 404 }
      );
    }

    const mentor = user.mentorProfile;

    if (!mentor.stripeConnectId) {
      return NextResponse.json({
        ok: true,
        data: {
          hasAccount: false,
          isOnboarded: false,
        },
      });
    }

    const status = await checkAccountOnboarding(mentor.stripeConnectId);

    if (status.onboarded && !mentor.stripeOnboarded) {
      await db.mentor.update({
        where: { id: mentor.id },
        data: {
          stripeOnboarded: true,
          onboardingComplete: true,
          onboardingStep: 5,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        hasAccount: true,
        isOnboarded: status.onboarded,
        ...status,
      },
    });
  } catch (error) {
    console.error("[stripe-connect] GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}
