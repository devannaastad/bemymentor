// app/catalog/page.tsx
import SectionHeader from "@/components/common/SectionHeader";
import { Card, CardContent } from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

const CATEGORIES = ["Trading", "Gaming", "Design", "Fitness", "Languages", "Career"];

export default function CatalogPage() {
  return (
    <section className="section">
      <SectionHeader
        title="Browse mentors"
        subtitle="Filter by category, price, and rating. (Placeholder—real search & filters coming soon.)"
      />

      <div className="container mt-8 grid gap-4 md:grid-cols-[240px,1fr]">
        <aside className="h-fit">
          <Card>
            <CardContent className="grid gap-3">
              <div className="font-medium">Filters</div>

              <div>
                <div className="mb-1 text-white/80">Category</div>
                <div className="grid gap-2">
                  {CATEGORIES.map((c) => (
                    <Button key={c} variant="ghost" size="sm" className="justify-start">
                      {c}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1 text-white/80">Price</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="$ min" />
                  <Input placeholder="$ max" />
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="grid gap-4">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <Card key={id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Mentor #{id}</h3>
                  <p className="muted text-sm">Category • Short tagline about expertise</p>
                </div>
                <Button href="#">View</Button>
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    </section>
  );
}
