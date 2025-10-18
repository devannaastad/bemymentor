// app/(auth)/signin/page.tsx
import Link from "next/link";
import { signIn } from "@/auth";
import Button from "@/components/common/Button";

export const metadata = {
  title: "Sign in • BeMyMentor",
};

const hasGoogleAuth = !!(
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET
);

type PageProps = {
  searchParams?: Promise<{ error?: string; callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = params?.error;
  const callbackUrl = params?.callbackUrl;

  const googleSignIn = async () => {
    "use server";
    try {
      await signIn("google", { redirectTo: callbackUrl || "/" });
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  return (
    <section className="min-h-[calc(100vh-120px)] grid place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-white/60">
              Sign in to continue. New here?{" "}
              <Link href="/apply" className="underline underline-offset-4">
                become a mentor
              </Link>
              .
            </p>
          </div>

          {/* Error Message */}
          {error === "unauthorized" && (
            <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3">
              <p className="text-sm text-rose-200">
                ⚠️ You need to sign in to access the admin panel.
              </p>
            </div>
          )}

          {hasGoogleAuth ? (
            <div className="grid gap-3">
              <form action={googleSignIn}>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center active:translate-y-[1px] transition-transform"
                >
                  <svg
                    aria-hidden
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 31.6 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l5.7-5.7C33.9 5 29.2 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.2-.1-2.4-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.7 3l5.7-5.7C33.9 5 29.2 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.5-5.2l-6.2-5.1C29.3 35.6 26.8 37 24 37c-5.2 0-9.6-3.4-11.2-8.2l-6.5 5C9 40.5 15 45 24 45z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3.1 5.1-5.9 6.6l.1.1 6.2 5.1c-.4.3 8.3-4.8 8.3-15.8 0-1.2-.1-2.4-.4-3.5z" />
                  </svg>
                  Continue with Google
                </Button>
              </form>
            </div>
          ) : (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-sm text-yellow-200">
                ⚠️ Authentication is not configured yet. Please add Google OAuth credentials to your <code className="text-xs bg-black/30 px-1 py-0.5 rounded">.env.local</code> file.
              </p>
              <div className="mt-3">
                <Link 
                  href="/catalog" 
                  className="text-sm text-yellow-100 underline underline-offset-2"
                >
                  Browse catalog without signing in →
                </Link>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-white/50">
            By signing in you agree to our{" "}
            <Link href="/legal/tos" className="underline underline-offset-4">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}