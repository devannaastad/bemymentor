// components/catalog/MentorCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
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

  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggle(m.id);
  };

  return (
    <Card>
      <CardContent className="grid gap-4 md:grid-cols-[auto,1fr,auto] md:items-center">
        {/* Profile Image */}
        <Link href={`/mentors/${m.id}`} className="shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white/10">
            {m.profileImage ? (
              <Image
                src={m.profileImage}
                alt={m.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white">
                {m.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        {/* Mentor Info */}
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/mentors/${m.id}`}
              className="text-lg font-semibold hover:underline"
            >
              {m.name}
            </Link>
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

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button href={`/mentors/${m.id}`}>View</Button>
          <Button
            variant={saved ? "primary" : "ghost"}
            onClick={handleSaveClick}
          >
            {saved ? "✓ Saved" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}