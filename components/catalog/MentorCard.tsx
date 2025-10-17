// components/catalog/MentorCard.tsx
"use client";

import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { formatCurrency, ratingLabel } from "@/lib/utils/format";
import type { Mentor } from "@prisma/client";
import { useSaved } from "./useSaved";

export default function MentorCard({ m }: { m: Mentor }) {
  const { isSaved, toggle } = useSaved();

  const saved = isSaved(m.id);
  const badges = Array.isArray(m.badges) ? (m.badges as string[]) : [];

  return (
    <Card>
      <CardContent className="grid gap-3 md:grid-cols-[1fr,auto] md:items-center">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{m.name}</h3>
            {badges.map((b) => (
              <Badge key={b} variant="success">
                {b}
              </Badge>
            ))}
          </div>
          <p className="muted text-sm">{m.tagline}</p>
          <div className="text-sm text-white/80">{ratingLabel(m.rating, m.reviews)}</div>
          <div className="flex flex-wrap gap-2 text-sm">
            {m.offerType !== "TIME" && m.accessPrice != null && (
              <Badge variant="outline">ACCESS {formatCurrency(m.accessPrice)}</Badge>
            )}
            {m.offerType !== "ACCESS" && m.hourlyRate != null && (
              <Badge variant="outline">TIME {formatCurrency(m.hourlyRate)}/hr</Badge>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button href="#">View</Button>
          <Button
            variant={saved ? "primary" : "ghost"}
            onClick={(e) => {
              e.preventDefault();
              toggle(m.id);
            }}
          >
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
