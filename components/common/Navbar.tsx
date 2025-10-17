// components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">
          BeMyMentor
        </Link>
        <nav className="hidden gap-6 sm:flex">
          <Link href="/catalog">Browse</Link>
          <Link href="/apply">Become a Mentor</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#trust">Trust & Safety</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/signin" className="btn btn-ghost h-9 px-4">
            Sign in
          </Link>
          <Link href="/apply" className="btn btn-primary h-9 px-4">
            Start mentoring
          </Link>
        </div>
      </div>
    </header>
  );
}
