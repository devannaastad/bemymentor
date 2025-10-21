// app/catalog/page.tsx
import { cache, Suspense } from "react";
import { headers } from "next/headers";
import { Card, CardContent } from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import MentorCard from "@/components/catalog/MentorCard";
import MentorCardShimmer from "@/components/catalog/MentorCardShimmer";
import Badge from "@/components/common/Badge";
import type { Mentor } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Mentors",
  description:
    "Explore our catalog of expert mentors in trading, gaming, design, fitness, languages, and career coaching. Filter by category, price, and availability.",
  openGraph: {
    title: "Browse Mentors | BeMyMentor",
    description:
      "Find the perfect mentor for your goals. Browse expert coaches and mentors across multiple categories.",
  },
};

export const revalidate = 60;

type SP = {
  q?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  type?: "ACCESS" | "TIME" | "BOTH";
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

  if (mentors.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="muted">No mentors found. Try clearing filters.</p>
        </CardContent>
      </Card>
    );
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

function ActiveFilters({ sp }: { sp: SP }) {
  const hasFilters = sp.q || sp.category || sp.priceMin || sp.priceMax || sp.type;

  if (!hasFilters) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-white/60">Active filters:</span>
      {sp.q && <Badge variant="outline">Search: {sp.q}</Badge>}
      {sp.category && <Badge variant="outline">Category: {sp.category}</Badge>}
      {sp.priceMin && <Badge variant="outline">Min: ${sp.priceMin}</Badge>}
      {sp.priceMax && <Badge variant="outline">Max: ${sp.priceMax}</Badge>}
      {sp.type && <Badge variant="outline">Type: {sp.type}</Badge>}
      <Button href="/catalog" variant="ghost" size="sm">
        Clear all
      </Button>
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
        <h1 className="h1 mb-6">Browse mentors</h1>

        <div className="grid gap-4 md:grid-cols-[280px,1fr]">
          {/* Sidebar: Filters */}
          <aside className="h-fit">
            <Card>
              <CardContent>
                <form method="GET" className="grid gap-3">
                  <div className="grid gap-2">
                    <label htmlFor="search" className="text-sm text-white/80">
                      Search
                    </label>
                    <Input
                      id="search"
                      name="q"
                      defaultValue={sp.q ?? ""}
                      placeholder="Valorant, trading, design…"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="category" className="text-sm text-white/80">
                      Category
                    </label>
                    <Select id="category" name="category" defaultValue={sp.category ?? ""}>
                      <option value="">All</option>
                      <option value="trading">Trading</option>
                      <option value="gaming">Gaming</option>
                      <option value="design">Design</option>
                      <option value="fitness">Fitness</option>
                      <option value="languages">Languages</option>
                      <option value="career">Career</option>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <label htmlFor="priceMin" className="text-sm text-white/80">
                        Min $
                      </label>
                      <Input
                        id="priceMin"
                        name="priceMin"
                        defaultValue={sp.priceMin ?? ""}
                        placeholder="0"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="priceMax" className="text-sm text-white/80">
                        Max $
                      </label>
                      <Input
                        id="priceMax"
                        name="priceMax"
                        defaultValue={sp.priceMax ?? ""}
                        placeholder="1000"
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="type" className="text-sm text-white/80">
                      Offer type
                    </label>
                    <Select id="type" name="type" defaultValue={sp.type ?? ""}>
                      <option value="">Any</option>
                      <option value="ACCESS">ACCESS</option>
                      <option value="TIME">TIME</option>
                      <option value="BOTH">BOTH</option>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="sort" className="text-sm text-white/80">
                      Sort by
                    </label>
                    <Select id="sort" name="sort" defaultValue={sp.sort ?? "rating"}>
                      <option value="rating">Highest Rated</option>
                      <option value="reviews">Most Reviews</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">
                      Apply
                    </Button>
                    <Button href="/catalog" variant="ghost">
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <main>
            <ActiveFilters sp={sp} />
            <Suspense key={apiUrl} fallback={<CatalogFallback />}>
              <CatalogResults url={apiUrl} sp={sp} />
            </Suspense>
          </main>
        </div>
      </div>
    </section>
  );
}
