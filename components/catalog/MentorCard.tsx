// components/catalog/MentorCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { formatCurrency } from "@/lib/utils/format";
import type { Mentor, SubscriptionPlan } from "@prisma/client";
import { useSaved } from "./useSaved";
import { getCategoryLabel, getCategoryIcon } from "@/lib/utils/categories";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MentorWithSubscriptions = Mentor & {
  subscriptionPlans?: SubscriptionPlan[];
};

type MediaItem = {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
};

export default function MentorCard({ m }: { m: MentorWithSubscriptions }) {
  const { isSaved, toggle } = useSaved();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const saved = isSaved(m.id);
  const badges = Array.isArray(m.badges) ? (m.badges as string[]) : [];
  const skills = Array.isArray(m.skills) ? (m.skills as string[]) : [];
  const displayedSkills = skills.slice(0, 3); // Show first 3 skills
  const remainingSkills = skills.length - displayedSkills.length;

  // Banner content
  const bannerMedia = (m.bannerMedia as unknown as MediaItem[]) || [];
  const bannerTagline = m.bannerTagline || "";

  const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggle(m.id);
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % bannerMedia.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + bannerMedia.length) % bannerMedia.length);
  };

  // Get cheapest subscription plan if available
  const cheapestSubscription = m.subscriptionPlans?.[0]; // Already sorted by price in API
  const hasSubscription = !!cheapestSubscription;

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
        {/* Top Section - Profile Image, Banner Carousel, and Info */}
        <div className="grid gap-4 items-start">
          <div className="flex gap-4 items-start">
            {/* Profile Image - Larger rounded box */}
            <Link href={`/mentors/${m.id}`} className="shrink-0">
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

            {/* Banner Media Carousel - Next to profile image */}
            {bannerMedia.length > 0 && (
              <div className="flex-1">
                <div className="relative overflow-hidden h-44">
                  <div className="flex gap-3 items-center justify-center h-full">
                    {/* Always render 5 slots, active item always in center (slot 2) */}
                    {[-2, -1, 0, 1, 2].map((offset) => {
                      const index = currentMediaIndex + offset;
                      const exists = index >= 0 && index < bannerMedia.length;

                      if (!exists) {
                        // Render empty invisible slot to maintain spacing
                        return (
                          <div
                            key={`empty-${offset}`}
                            className="relative shrink-0"
                            style={{
                              height: '160px',
                              width: '160px',
                              opacity: 0,
                              pointerEvents: 'none',
                            }}
                          />
                        );
                      }

                      const item = bannerMedia[index];
                      const isActive = offset === 0;
                      const distance = Math.abs(offset);
                      const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.3 : 0;
                      const scale = distance === 0 ? 1 : distance === 1 ? 0.85 : 0.7;

                      // Performance optimization: only load images within distance 1 of active
                      const shouldLoadMedia = distance <= 1;

                      return (
                        <div
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentMediaIndex(index);
                          }}
                          className="relative shrink-0 overflow-hidden rounded-lg bg-black/40 transition-all duration-300 cursor-pointer"
                          style={{
                            opacity,
                            transform: `scale(${scale})`,
                            height: '160px',
                            width: '160px',
                          }}
                        >
                          {shouldLoadMedia ? (
                            item.type === "image" ? (
                              <Image
                                src={item.url}
                                alt={`Banner ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="160px"
                                loading={isActive ? "eager" : "lazy"}
                                priority={isActive}
                              />
                            ) : (
                              // For videos, show thumbnail (if available) with play icon overlay
                              <>
                                {item.thumbnail ? (
                                  <Image
                                    src={item.thumbnail}
                                    alt={`Video ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="160px"
                                    loading={isActive ? "eager" : "lazy"}
                                    priority={isActive}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <svg className="h-12 w-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </>
                            )
                          ) : (
                            // Placeholder for items not yet loaded (distance > 1)
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
                          )}
                          {isActive && (
                            <div className="absolute top-2 right-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const win = window.open('', '_blank');
                                  if (win) {
                                    if (item.type === 'image') {
                                      win.document.write(`
                                        <html>
                                          <head><title>View Image</title></head>
                                          <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
                                            <img src="${item.url}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                                          </body>
                                        </html>
                                      `);
                                    } else {
                                      win.document.write(`
                                        <html>
                                          <head><title>View Video</title></head>
                                          <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
                                            <video controls autoplay style="max-width:100%;max-height:100vh;" src="${item.url}"></video>
                                          </body>
                                        </html>
                                      `);
                                    }
                                  }
                                }}
                                className="rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
                                aria-label="View fullscreen"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation arrows */}
                  {bannerMedia.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          prevMedia();
                        }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 z-10"
                        aria-label="Previous media"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          nextMedia();
                        }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 z-10"
                        aria-label="Next media"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Tagline below carousel */}
                {bannerTagline && (
                  <div className="text-center mt-2">
                    <p className="text-sm font-bold text-white tracking-wide uppercase">
                      {bannerTagline}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

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
              {/* Show all selected categories */}
              {m.categories && m.categories.length > 0 ? (
                m.categories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {getCategoryIcon(cat)} {getCategoryLabel(cat)}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-xs">
                  {getCategoryIcon(m.category)} {getCategoryLabel(m.category)}
                </Badge>
              )}
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
          </div>
        </div>

        {/* Pricing - Show all available pricing options */}
        <div className="flex items-start gap-4 mt-2 pt-3 border-t border-white/10 flex-wrap">
          {/* Session Price */}
          {(m.offerType === "TIME" || m.offerType === "BOTH") && m.hourlyRate != null && (
            <div className="flex-1 min-w-[140px]">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-white/60 text-xs uppercase tracking-wide font-medium">Live Session</span>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-primary-400">
                  {formatCurrency(m.hourlyRate)}
                </p>
                <span className="text-xs text-white/60">/hour</span>
              </div>
            </div>
          )}

          {/* Access Price */}
          {(m.offerType === "ACCESS" || m.offerType === "BOTH") && m.accessPrice != null && (
            <div className="flex-1 min-w-[140px]">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-white/60 text-xs uppercase tracking-wide font-medium">Content Pass</span>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-primary-400">
                  {formatCurrency(m.accessPrice)}
                </p>
                <span className="text-xs text-white/60">one-time</span>
              </div>
            </div>
          )}

          {/* Subscription Price */}
          {hasSubscription && cheapestSubscription && (
            <div className="flex-1 min-w-[140px]">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-white/60 text-xs uppercase tracking-wide font-medium">Subscription</span>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-primary-400">
                  {formatCurrency(cheapestSubscription.price)}
                </p>
                <span className="text-xs text-white/60">
                  /{cheapestSubscription.interval.toLowerCase()}
                </span>
              </div>
            </div>
          )}
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