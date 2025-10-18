// app/admin/unauthorized/page.tsx
import Button from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";

export default function UnauthorizedPage() {
  return (
    <section className="section">
      <div className="container max-w-2xl">
        <Card className="border-rose-500/20 bg-rose-500/10">
          <CardContent className="text-center">
            <div className="mb-4 text-6xl">🔒</div>
            <h1 className="h2 mb-2">Access Denied</h1>
            <p className="muted mb-6">
              You don&apos;t have permission to access this page. Only administrators can view the admin panel.
            </p>
            <div className="flex justify-center gap-3">
              <Button href="/">Go Home</Button>
              <Button href="/signin" variant="ghost">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}