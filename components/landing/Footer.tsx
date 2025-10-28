import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-amber-600">
                <span className="text-sm font-bold text-white">BM</span>
              </div>
              <span className="text-lg font-bold">BeMyMentor</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Mentorship for the next generation of creators, gamers, and traders.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-white">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/catalog" className="text-muted-foreground transition-colors hover:text-white">
                  Browse Mentors
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-muted-foreground transition-colors hover:text-white">
                  Become a Mentor
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=GAMING_ESPORTS" className="text-muted-foreground transition-colors hover:text-white">
                  Gaming & Esports
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=TRADING_INVESTING" className="text-muted-foreground transition-colors hover:text-white">
                  Trading & Investing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-white">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@bemymentor.com"
                  className="text-muted-foreground transition-colors hover:text-white"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="mailto:abuse@bemymentor.com"
                  className="text-muted-foreground transition-colors hover:text-white"
                >
                  Report Abuse
                </a>
              </li>
              <li>
                <a
                  href="mailto:mentors@bemymentor.com"
                  className="text-muted-foreground transition-colors hover:text-white"
                >
                  Mentor Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-white">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground transition-colors hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:legal@bemymentor.com"
                  className="text-muted-foreground transition-colors hover:text-white"
                >
                  Legal Inquiries
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BeMyMentor. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="https://twitter.com/bemymentor" className="transition-colors hover:text-white">
                Twitter
              </a>
              <a href="https://discord.gg/bemymentor" className="transition-colors hover:text-white">
                Discord
              </a>
              <a href="https://github.com/bemymentor" className="transition-colors hover:text-white">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
