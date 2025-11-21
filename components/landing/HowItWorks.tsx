// components/HowItWorks.tsx
import { Search, ShoppingCart, CheckCircle, Book, Video, RefreshCw } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "1) Browse & Filter Mentors",
      desc: "Search by category, price, rating, and language. Read verified-purchase reviews from real students.",
    },
    {
      icon: ShoppingCart,
      title: "2) Choose Your Learning Style",
      desc: "Pick Content Pass for one-time access, subscribe for ongoing content, or book Live 1-on-1 Sessions for personalized coaching.",
    },
    {
      icon: CheckCircle,
      title: "3) Get Instant Access & Learn",
      desc: "Content unlocks immediately. Sessions include calendar invites & reminders. Leave a review when done.",
    },
  ];

  const offerings = [
    {
      icon: Book,
      title: "Content Pass",
      badge: "One-Time Payment",
      desc: "Lifetime access to exclusive guides, resources, Discord communities, and ongoing content updates.",
      examples: "Perfect for: Self-paced learning, community access, reference materials",
    },
    {
      icon: RefreshCw,
      title: "Monthly Subscription",
      badge: "Recurring Access",
      desc: "Subscribe for continuous access to evolving content, exclusive updates, and ongoing community engagement.",
      examples: "Perfect for: Active learners, ongoing support, regular content updates",
    },
    {
      icon: Video,
      title: "Live 1-on-1 Sessions",
      badge: "Pay Per Session",
      desc: "Book personalized video coaching sessions at your convenience. Get direct feedback and tailored advice.",
      examples: "Perfect for: VOD reviews, portfolio critiques, personalized strategies",
    },
  ];

  return (
    <section id="how-it-works" className="section bg-gradient-to-b from-black to-purple-950/20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="h2">How It Works</h2>
          <p className="muted mt-2 text-lg">
            Simple, transparent, and built for your success
          </p>
        </div>

        {/* Main Steps */}
        <div className="mt-10 grid gap-6 md:grid-cols-3 mb-16">
          {steps.map((s) => (
            <div key={s.title} className="card p-6 border-2 border-white/10 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-bold text-lg">{s.title}</h3>
              </div>
              <p className="muted text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Three Types Explained */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Three Ways to Learn</h3>
            <p className="text-white/60">Choose the format that fits your learning style</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((offering) => (
              <div
                key={offering.title}
                className="card p-6 border-2 border-white/10 hover:border-purple-500/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <offering.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-white">{offering.title}</h4>
                        <span className="text-xs text-purple-400 font-medium">{offering.badge}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/80 mb-3 leading-relaxed">{offering.desc}</p>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-sm text-white/60 italic">{offering.examples}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
