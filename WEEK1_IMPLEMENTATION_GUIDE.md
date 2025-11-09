# Week 1 Search Improvements - Implementation Guide

## Summary
This guide provides the code to implement Week 1 improvements to the BeMyMentor search system.

## Components to Create

### 1. SearchHero.tsx - Prominent Search Bar
```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const EXAMPLES = [
  "Valorant coaching",
  "Options trading",
  "YouTube thumbnails",
  "Twitch growth",
  "Rocket League",
];

export default function SearchHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [placeholder, setPlaceholder] = useState(EXAMPLES[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <div className="bg-gradient-to-br from-primary-900/20 to-primary-800/10 border border-primary-500/20 rounded-2xl p-8 mb-8">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">
        What do you want to learn?
      </h2>
      <p className="text-white/60 text-center mb-6">
        Find expert mentors in gaming, trading, streaming, and content creation
      </p>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`e.g., "${placeholder}"`}
            className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
          />
        </div>
      </form>

      <div className="flex gap-2 justify-center mt-4 flex-wrap">
        <span className="text-white/40 text-sm">Popular:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => setQuery(example)}
            className="text-sm text-primary-400 hover:text-primary-300 transition"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 2. CategoryPills.tsx - Quick Category Filter
```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { value: "", label: "All Categories", emoji: "🎯" },
  { value: "GAMING_ESPORTS", label: "Gaming & Esports", emoji: "🎮" },
  { value: "TRADING_INVESTING", label: "Trading & Investing", emoji: "📈" },
  { value: "STREAMING_CONTENT", label: "Streaming", emoji: "📺" },
  { value: "YOUTUBE_PRODUCTION", label: "YouTube", emoji: "🎥" },
];

export default function CategoryPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";

  const handleCategoryClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.delete("page"); // Reset to page 1
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleCategoryClick(cat.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            currentCategory === cat.value
              ? "bg-primary-500 text-white"
              : "bg-dark-800 text-white/70 hover:bg-dark-700 hover:text-white border border-white/10"
          }`}
        >
          <span className="mr-1">{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
```

### 3. EnhancedFilters.tsx - Price Slider & Sort
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EnhancedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceMax, setPriceMax] = useState(
    parseInt(searchParams.get("priceMax") || "500")
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating");

  const handlePriceChange = (value: number) => {
    setPriceMax(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value < 500) {
      params.set("priceMax", value.toString());
    } else {
      params.delete("priceMax");
    }
    router.push(`/catalog?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <div className="bg-dark-900 rounded-xl p-6 border border-white/10 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Max Price: ${priceMax}{priceMax >= 500 ? "+" : ""}
          </label>
          <input
            type="range"
            min="0"
            max="500"
            step="25"
            value={priceMax}
            onChange={(e) => handlePriceChange(parseInt(e.target.value))}
            className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>$0</span>
            <span>$500+</span>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="price-low">Lowest Price</option>
            <option value="price-high">Highest Price</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {(priceMax < 500 || searchParams.get("category") || searchParams.get("q")) && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-white/60">Active filters:</span>
            {searchParams.get("q") && (
              <FilterChip
                label={`Search: "${searchParams.get("q")}"`}
                onRemove={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("q");
                  router.push(`/catalog?${params.toString()}`);
                }}
              />
            )}
            {searchParams.get("category") && (
              <FilterChip
                label={`Category: ${searchParams.get("category")}`}
                onRemove={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("category");
                  router.push(`/catalog?${params.toString()}`);
                }}
              />
            )}
            {priceMax < 500 && (
              <FilterChip
                label={`Under $${priceMax}`}
                onRemove={() => handlePriceChange(500)}
              />
            )}
            <button
              onClick={() => router.push("/catalog")}
              className="text-sm text-red-400 hover:text-red-300 ml-2"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-full border border-primary-500/30">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white transition"
      >
        ×
      </button>
    </span>
  );
}
```

### 4. Enhanced MentorCard.tsx
Update the existing MentorCard to show more info. Key additions:
- Larger profile image
- Verified badge if `isTrusted`
- "Starting at $X" pricing
- Quick stats (reviews count, rating)
- Improved hover effects

## Implementation Steps

1. **Create the new components** in `/components/catalog/`
2. **Update catalog page** to use these components
3. **Test on mobile** - filters should work responsively
4. **Verify URL params** - filters should update URL for sharing

## Next Session
After implementing these, we can add:
- Autocomplete suggestions
- Empty states with recommendations
- Mobile filter drawer
- Loading skeletons
