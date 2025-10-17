// components/Hero.tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="section">
      <div className="container grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="h1">
            Find verified mentors.
            <br /> Learn faster. Pay less.
          </h1>
          <p className="muted mt-4 max-w-xl">
            Real coaches, real outcomes. Review-driven listings with transparent
            pricing. No fluff, no hidden upsells.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog" className="btn btn-primary">
              Browse mentors
            </Link>
            <Link href="/apply" className="btn btn-ghost">
              Become a mentor
            </Link>
          </div>
          <ul className="mt-6 grid gap-2 text-sm text-white/70">
            <li>• Verified-purchase reviews</li>
            <li>• Stripe-powered secure payments</li>
            <li>• Refund & dispute policy that protects you</li>
          </ul>
        </div>
        <div className="card p-4">
          {/* simple showcase placeholder */}
          <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-fuchsia-600/30 via-purple-600/20 to-blue-600/20" />
          <p className="muted mt-3 text-sm">
            Coming soon: live catalog preview and top mentors.
          </p>
        </div>
      </div>
    </section>
  );
}
