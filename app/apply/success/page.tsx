// app/apply/success/page.tsx
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";

export const metadata = {
  title: "Application Submitted • BeMyMentor",
};

export default function ApplicationSuccessPage() {
  return (
    <section className="section">
      <div className="container max-w-2xl">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="text-center">
            <div className="mb-4 text-6xl">✅</div>
            <h1 className="h2 mb-2">Application Submitted!</h1>
            <p className="mb-6 text-white/70">
              Thank you for applying to become a mentor on BeMyMentor. We&apos;ve received your application and will review it within 48 hours.
            </p>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-left">
              <h3 className="mb-2 font-semibold text-blue-200">What happens next?</h3>
              <ol className="space-y-2 text-sm text-blue-100">
                <li>1. We&apos;ll review your application and proof links</li>
                <li>2. You&apos;ll receive an email with our decision</li>
                <li>3. If approved, we&apos;ll help you set up your mentor profile</li>
              </ol>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Button href="/">Browse Catalog</Button>
              <Button href="/dashboard" variant="ghost">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}