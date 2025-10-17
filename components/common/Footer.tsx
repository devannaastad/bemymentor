// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 text-sm text-white/70">
      <div className="container grid gap-6 md:grid-cols-3">
        <div>
          <div className="font-semibold text-white">BeMyMentor</div>
          <p className="mt-2">
            © {new Date().getFullYear()} BeMyMentor, Inc. All rights reserved.
          </p>
        </div>
        <nav className="grid gap-2">
          <Link href="/catalog">Browse mentors</Link>
          <Link href="/apply">Become a mentor</Link>
          <Link href="/#trust">Trust & Safety</Link>
        </nav>
        <nav className="grid gap-2">
          <Link href="/legal/tos">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/refunds">Refunds</Link>
        </nav>
      </div>
    </footer>
  );
}
