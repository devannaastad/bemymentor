// components/landing/Categories.tsx
import Link from "next/link";
import { Gamepad2, TrendingUp, Radio, Film } from "lucide-react";

const CATS = [
  {
    slug: "GAMING_ESPORTS",
    label: "Gaming & Esports",
    icon: Gamepad2,
    description: "Valorant, Rocket League, competitive coaching",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    slug: "TRADING_INVESTING",
    label: "Trading & Investing",
    icon: TrendingUp,
    description: "Crypto, options, technical analysis",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    slug: "STREAMING_CONTENT",
    label: "Streaming & Content",
    icon: Radio,
    description: "Twitch, YouTube Live, audience growth",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    slug: "YOUTUBE_PRODUCTION",
    label: "YouTube Production",
    icon: Film,
    description: "Editing, thumbnails, branding",
    gradient: "from-amber-500 to-orange-500",
  },
];

export default function Categories() {
  return (
    <section className="section relative">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.1),transparent_70%)]" />

      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="text-amber-200">Digital Creator Economy</span>
          </div>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Find Your Expert Mentor
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Specialized mentorship in the skills that matter for the next generation
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`/catalog?category=${c.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:scale-105"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 transition-opacity group-hover:opacity-10`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} bg-opacity-20`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Label */}
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {c.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-white/60 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/40 transition-colors group-hover:text-white/70">
                    Browse mentors
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
