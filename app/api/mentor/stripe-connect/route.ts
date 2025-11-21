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
      try {
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
      } catch (accountError) {
        const errorMessage = accountError instanceof Error ? accountError.message : String(accountError);
        console.error("[stripe-connect] Error checking Stripe account:", mentor.stripeConnectId, errorMessage);

        // Only clear the account ID if it's actually invalid (404, doesn't exist)
        // Don't clear for temporary errors like network issues, rate limits, etc.
        const shouldClearAccount =
          errorMessage.includes("No such account") ||
          errorMessage.includes("does not exist") ||
          errorMessage.includes("resource_missing") ||
          errorMessage.includes("account_invalid");

        if (shouldClearAccount) {
          console.log("[stripe-connect] Account truly invalid, clearing:", mentor.stripeConnectId);
          await db.mentor.update({
            where: { id: mentor.id },
            data: {
              stripeConnectId: null,
              stripeOnboarded: false,
            },
          });
          // Fall through to create new account below
        } else {
          // For other errors (API issues, rate limits, etc.), return error instead of creating new account
          console.error("[stripe-connect] Temporary error, not creating new account");
          return NextResponse.json(
            {
              ok: false,
              error: "Unable to access Stripe account. Please try again in a moment.",
              temporary: true
            },
            { status: 503 }
          );
        }
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

    // Check if this is the platform profile configuration error
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if Stripe Connect is not enabled
    if (errorMessage.includes("signed up for Connect") ||
        errorMessage.includes("learn how to do at https://stripe.com/docs/connect")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Stripe Connect is not enabled for this account. Please enable it at https://dashboard.stripe.com/connect/accounts/overview",
          connectNotEnabled: true,
          setupUrl: "https://dashboard.stripe.com/connect/accounts/overview"
        },
        { status: 400 }
      );
    }

    if (errorMessage.includes("responsibilities of managing losses") ||
        errorMessage.includes("platform-profile")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Stripe platform configuration incomplete. Please configure your platform settings at https://dashboard.stripe.com/settings/connect/platform-profile",
          configError: true
        },
        { status: 400 }
      );
    }

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

    try {
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
    } catch (accountError) {
      const errorMessage = accountError instanceof Error ? accountError.message : String(accountError);
      console.error("[stripe-connect] Error checking Stripe account in GET:", mentor.stripeConnectId, errorMessage);

      // Only clear the account ID if it's actually invalid (404, doesn't exist)
      const shouldClearAccount =
        errorMessage.includes("No such account") ||
        errorMessage.includes("does not exist") ||
        errorMessage.includes("resource_missing") ||
        errorMessage.includes("account_invalid");

      if (shouldClearAccount) {
        console.log("[stripe-connect] Account truly invalid in GET, clearing:", mentor.stripeConnectId);
        await db.mentor.update({
          where: { id: mentor.id },
          data: {
            stripeConnectId: null,
            stripeOnboarded: false,
          },
        });

        return NextResponse.json({
          ok: true,
          data: {
            hasAccount: false,
            isOnboarded: false,
          },
        });
      } else {
        // For temporary errors, still return the account exists but with error info
        return NextResponse.json({
          ok: true,
          data: {
            hasAccount: true,
            isOnboarded: mentor.stripeOnboarded || false,
            error: "Temporary error checking account status",
          },
        });
      }
    }
  } catch (error) {
    console.error("[stripe-connect] GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}
