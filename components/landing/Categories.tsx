// components/Categories.tsx
import Link from "next/link";

const CATS = [
  { slug: "trading", label: "Trading" },
  { slug: "gaming", label: "Gaming" },
  { slug: "design", label: "Design" },
  { slug: "fitness", label: "Fitness" },
  { slug: "languages", label: "Languages" },
  { slug: "career", label: "Career" },
];

export default function Categories() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="h2">Popular categories</h2>
        <p className="muted mt-2">
          We’ll expand as mentors apply and pass vetting.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 md:grid-cols-6">
          {CATS.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog?category=${c.slug}`}
              className="card px-4 py-3 text-center hover:bg-white/10"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
