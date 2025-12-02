// components/landing/Hero.tsx
import Button from "@/components/common/Button";
import { Sparkles, Users, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-black">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5,
          zIndex: 1
        }}
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"
        style={{ zIndex: 2 }}
      />

      {/* Animated gradient accents */}
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-amber-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(234,179,8,0.15),transparent_50%)]" />

        {/* Animated floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="container relative" style={{ zIndex: 10 }}>
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-200">Mentorship for the Next Generation</span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            Accelerate Your Growth with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Expert Mentors
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl">
            Connect with verified experts who are actively crushing it in their fields.
            Get personalized 1-on-1 sessions or unlock exclusive content and community access.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
            <Button
              href="/catalog"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-amber-600 px-8 py-4 text-lg font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Browse Mentors
                <Zap className="h-5 w-5" />
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-amber-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Button>
            <Button
              href="/apply"
              variant="ghost"
              className="border-2 border-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-white/5"
            >
              Become a Mentor
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">Instant</p>
              <p className="text-sm text-white/60">Book & Connect</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">Verified</p>
              <p className="text-sm text-white/60">Mentor Reviews</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <svg className="h-6 w-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">Secure</p>
              <p className="text-sm text-white/60">Stripe Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
