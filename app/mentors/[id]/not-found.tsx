// app/mentors/[id]/not-found.tsx//
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="h1 mb-2">Mentor not found</h1>
        <p className="text-white/60">
          The mentor you’re looking for doesn’t exist or was removed.
        </p>
        <div className="mt-4">
          <Link href="/catalog" className="underline underline-offset-4">
            ← Back to catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
