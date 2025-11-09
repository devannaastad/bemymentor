// components/catalog/MentorCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { formatCurrency } from "@/lib/utils/format";
import type { Mentor } from "@prisma/client";
import { useSaved } from "./useSaved";

export default function MentorCard({ m }: { m: Mentor }) {
  const { isSaved, toggle } = useSaved();

  const saved = isSaved(m.id);
  const badges = Array.isArray(m.badges) ? (m.badges as string[]) : [];
  const skills = Array.isArray(m.skills) ? (m.skills as string[]) : [];
  const displayedSkills = skills.slice(0, 3); // Show first 3 skills
  const remainingSkills = skills.length - displayedSkills.length;

  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggle(m.id);
  };

  // Calculate starting price
  const startingPrice = m.offerType === "ACCESS" && m.accessPrice
    ? m.accessPrice
    : m.hourlyRate || m.accessPrice || 0;

  return (
    <Card className="hover:border-primary-500/30 transition-colors relative">
      {/* Verified Badge - Gold checkmark in top-right of card */}
      {m.isTrusted && (
        <div className="absolute top-3 right-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full p-1.5 border-2 border-dark-900 shadow-lg shadow-yellow-500/50 z-10">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      <CardContent className="grid gap-4">
        {/* Top Section - Profile Image and Info Side by Side */}
        <div className="grid gap-4 md:grid-cols-[180px,1fr] items-start">
          {/* Profile Image - Larger rounded box */}
          <Link href={`/mentors/${m.id}`} className="shrink-0 mx-auto md:mx-0">
            <div className="relative h-44 w-44 overflow-hidden rounded-2xl border-2 border-white/10 hover:border-primary-500/50 transition-colors">
              {m.profileImage ? (
                <Image
                  src={m.profileImage}
                  alt={m.name}
                  fill
                  className="object-cover"
                  sizes="176px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-5xl font-bold text-white">
                  {m.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>

          {/* Mentor Info */}
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/mentors/${m.id}`}
                className="text-xl font-bold hover:underline"
              >
                {m.name}
              </Link>
              {badges.map((b) => (
                <Badge key={b} variant="success">
                  {b}
                </Badge>
              ))}
            </div>

            <p className="text-white/80 text-sm leading-relaxed">{m.tagline}</p>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">{m.rating}</span>
              <span className="text-white/60">({m.reviews} reviews)</span>
            </div>

            {/* Skills */}
            {displayedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {displayedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80 font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {remainingSkills > 0 && (
                  <span className="px-3 py-1 text-xs text-white/60">
                    +{remainingSkills} more
                  </span>
                )}
              </div>
            )}

            {/* Pricing - Show both prices if available */}
            <div className="flex items-start gap-6 mt-2 pt-3 border-t border-white/10">
              {m.offerType === "BOTH" ? (
                <>
                  {/* Session Price */}
                  {m.hourlyRate != null && (
                    <div>
                      <span className="text-white/60 text-xs uppercase tracking-wide">Session</span>
                      <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-primary-400">
                          {formatCurrency(m.hourlyRate)}
                        </p>
                        <span className="text-xs text-white/60">/hr</span>
                      </div>
                    </div>
                  )}
                  {/* Access Price */}
                  {m.accessPrice != null && (
                    <div>
                      <span className="text-white/60 text-xs uppercase tracking-wide">Access Pass</span>
                      <p className="text-2xl font-bold text-primary-400">
                        {formatCurrency(m.accessPrice)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <span className="text-white/60 text-xs uppercase tracking-wide">
                    {m.offerType === "ACCESS" ? "Access Pass" : "Session"}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-primary-400">
                      {formatCurrency(startingPrice)}
                    </p>
                    {m.offerType === "TIME" && (
                      <span className="text-xs text-white/60">/hr</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Action Buttons Spanning Full Width */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button href={`/mentors/${m.id}`} variant="primary" className="flex-1">
            View Profile
          </Button>
          <button
            onClick={handleSaveClick}
            className={`flex items-center justify-center gap-1.5 px-6 py-2 rounded-lg text-sm font-medium transition ${
              saved
                ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                : "bg-dark-800 text-white/70 hover:text-white border border-white/10 hover:border-white/20"
            }`}
          >
            <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}