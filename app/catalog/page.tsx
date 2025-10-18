// app/catalog/page.tsx
import { cache, Suspense } from "react";
import { headers } from "next/headers";
import { Card, CardContent } from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import MentorCard from "@/components/catalog/MentorCard";
import MentorCardShimmer from "@/components/catalog/MentorCardShimmer";
import type { Mentor } from "@prisma/client";

export const revalidate = 60;

type SP = {
  q?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  type?: "ACCESS" | "TIME" | "BOTH";
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

const fetchMentors = cache(async (absoluteUrl: string) => {
  const res = await fetch(absoluteUrl, { next: { revalidate: 60 } });
  if (!res.ok) return [] as Mentor[];
  const json = (await res.json()) as { ok: boolean; data: Mentor[] };
  return json?.data ?? [];
});

async function CatalogResults({ url }: { url: string }) {
  const mentors = await fetchMentors(url);

  if (mentors.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="muted">No mentors found. Try clearing filters.</p>
        </CardContent>
      </Card>
    );
  }

  return <>{mentors.map((m) => <MentorCard key={m.id} m={m} />)}</>;
}

function CatalogFallback() {
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => (
        <MentorCardShimmer key={i} />
      ))}
    </>
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
                    <label className="text-sm text-white/80">Search</label>
                    <Input name="q" defaultValue={sp.q ?? ""} placeholder="keywords…" />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm text-white/80">Category</label>
                    <Select name="category" defaultValue={sp.category ?? ""}>
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
                      <label className="text-sm text-white/80">Min $</label>
                      <Input name="priceMin" defaultValue={sp.priceMin ?? ""} inputMode="decimal" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm text-white/80">Max $</label>
                      <Input name="priceMax" defaultValue={sp.priceMax ?? ""} inputMode="decimal" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm text-white/80">Offer type</label>
                    <Select name="type" defaultValue={sp.type ?? ""}>
                      <option value="">Any</option>
                      <option value="ACCESS">ACCESS</option>
                      <option value="TIME">TIME</option>
                      <option value="BOTH">BOTH</option>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit">Apply</Button>
                    <Button href="/catalog" variant="ghost">Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <main className="grid gap-4">
            <Suspense fallback={<CatalogFallback />}>
              <CatalogResults url={apiUrl} />
            </Suspense>
          </main>
        </div>
      </div>
    </section>
  );
}
