// app/catalog/page.tsx
import { headers } from "next/headers";
import { Card, CardContent } from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Select from "@/components/common/Select";
import MentorCard from "@/components/catalog/MentorCard";
import type { Mentor } from "@prisma/client";

type SP = {
  q?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  type?: "ACCESS" | "TIME" | "BOTH";
};

type PageProps = {
  // Next 15 dynamic API: this is a Promise
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

export default async function CatalogPage({ searchParams }: PageProps) {
  // ✅ await the dynamic API before using
  const sp = (await searchParams) ?? {};
  const query = buildQuery(sp);

  // ✅ build absolute base URL from request headers (works locally + Vercel)
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/mentors${query}`, { next: { revalidate: 60 } });
  const json = (await res.json()) as { ok: boolean; data: Mentor[] };
  const mentors = json?.data ?? [];

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
            {mentors.length === 0 ? (
              <Card>
                <CardContent>
                  <p className="muted">No mentors found. Try clearing filters.</p>
                </CardContent>
              </Card>
            ) : (
              mentors.map((m) => <MentorCard key={m.id} m={m} />)
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
