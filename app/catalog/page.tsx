// app/catalog/page.tsx
import { cache, Suspense } from "react";
import { headers } from "next/headers";
import Button from "@/components/common/Button";
import MentorCard from "@/components/catalog/MentorCard";
import MentorCardShimmer from "@/components/catalog/MentorCardShimmer";
import SearchHero from "@/components/catalog/SearchHero";
import CategoryPills from "@/components/catalog/CategoryPills";
import EnhancedFilters from "@/components/catalog/EnhancedFilters";
import EmptyState from "@/components/catalog/EmptyState";
import type { Mentor } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Mentors",
  description:
    "Mentorship for the next generation of creators, gamers, and traders. Find expert mentors in Gaming, Trading, Streaming, and YouTube Production.",
  openGraph: {
    title: "Browse Mentors | BeMyMentor",
    description:
      "Find the perfect mentor for your goals. Expert mentors in Gaming & Esports, Trading & Investing, Streaming, and YouTube Production.",
  },
};

export const revalidate = 60;

type SP = {
  q?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  type?: "ACCESS" | "TIME" | "BOTH";
  skills?: string;
  sort?: string;
  page?: string;
};

type PageProps = {
  searchParams?: Promise<SP>;
};

function buildQuery(sp?: SP) {
  if (!sp) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v) params.set(k, v as string);
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

type MentorsResponse = {
  ok: boolean;
  data: Mentor[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
};

const fetchMentors = cache(async (absoluteUrl: string) => {
  const res = await fetch(absoluteUrl, { next: { revalidate: 60 } });
  if (!res.ok) return { data: [], meta: undefined };
  const json = (await res.json()) as MentorsResponse;
  return { data: json.data ?? [], meta: json.meta };
});

async function CatalogResults({ url, sp }: { url: string; sp: SP }) {
  const { data: mentors, meta } = await fetchMentors(url);

  const hasFilters = !!(
    sp.q ||
    sp.category ||
    sp.priceMin ||
    sp.priceMax ||
    sp.type ||
    sp.skills
  );

  if (mentors.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <>
      {/* Results Count */}
      {meta && (
        <div className="mb-4 text-sm text-white/60">
          Showing {mentors.length} of {meta.total} mentors
        </div>
      )}

      {/* Mentor Grid */}
      <div className="grid gap-4 mb-6">
        {mentors.map((m) => (
          <MentorCard key={m.id} m={m} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Button
              href={`/catalog${buildQuery({ ...sp, page: String(currentPage - 1) })}`}
              variant="ghost"
              size="sm"
            >
              ← Previous
            </Button>
          )}

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              const isActive = pageNum === currentPage;
              return (
                <Button
                  key={pageNum}
                  href={`/catalog${buildQuery({ ...sp, page: String(pageNum) })}`}
                  variant={isActive ? "primary" : "ghost"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          {currentPage < totalPages && (
            <Button
              href={`/catalog${buildQuery({ ...sp, page: String(currentPage + 1) })}`}
              variant="ghost"
              size="sm"
            >
              Next →
            </Button>
          )}
        </div>
      )}
    </>
  );
}

function CatalogFallback() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <MentorCardShimmer key={i} />
      ))}
    </div>
  );
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const query = buildQuery(sp);

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const apiUrl = `${baseUrl}/api/mentors${query}`;

  return (
    <section className="section">
      <div className="container">
        {/* Hero Heading */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse">
            Find Your Mentor
          </h1>
        </div>

        {/* Search Hero */}
        <SearchHero />

        {/* Category Pills */}
        <CategoryPills />

        {/* Enhanced Filters */}
        <EnhancedFilters />

        {/* Results */}
        <div>
          <Suspense fallback={<CatalogFallback />}>
            <CatalogResults url={apiUrl} sp={sp} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
