// app/not-found.tsx
import { Card, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";

export const metadata = {
  title: "Page Not Found • BeMyMentor",
};

export default function NotFound() {
  return (
    <section className="section">
      <div className="container max-w-2xl">
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h1 className="h2 mb-2">Page Not Found</h1>
            <p className="mb-6 text-white/70">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
            </p>
            <div className="flex justify-center gap-3">
              <Button href="/">Go Home</Button>
              <Button href="/" variant="ghost">
                Browse Mentors
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}