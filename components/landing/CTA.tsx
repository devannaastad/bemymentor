// components/CTA.tsx
import Link from "next/link";

export default function CTA() {
  return (
    <section className="section">
      <div className="container card flex flex-col items-center gap-4 p-8 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h3 className="text-xl font-semibold">Ready to get started?</h3>
          <p className="muted mt-1">
            Browse mentors or apply to become one—MVP rolling out now.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/catalog" className="btn btn-primary">
            Find a mentor
          </Link>
          <Link href="/apply" className="btn btn-ghost">
            Become a mentor
          </Link>
        </div>
      </div>
    </section>
  );
}
