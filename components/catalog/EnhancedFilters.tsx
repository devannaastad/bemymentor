"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EnhancedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceMax, setPriceMax] = useState(() => {
    const priceMaxParam = searchParams.get("priceMax");
    // Convert from cents to dollars for display
    return priceMaxParam ? Math.round(parseInt(priceMaxParam) / 100) : 500;
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating");
  const [minRating, setMinRating] = useState(
    parseFloat(searchParams.get("minRating") || "0")
  );
  const [verifiedOnly, setVerifiedOnly] = useState(
    searchParams.get("verified") === "true"
  );

  const handlePriceChange = (value: number) => {
    setPriceMax(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value < 500) {
      // Convert dollars to cents for the API
      params.set("priceMax", (value * 100).toString());
    } else {
      params.delete("priceMax");
    }
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
  };

  const handleRatingChange = (value: number) => {
    setMinRating(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value > 0) {
      params.set("minRating", value.toString());
    } else {
      params.delete("minRating");
    }
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
  };

  const handleVerifiedToggle = () => {
    const newValue = !verifiedOnly;
    setVerifiedOnly(newValue);
    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set("verified", "true");
    } else {
      params.delete("verified");
    }
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
  };

  const activeFiltersCount = [
    searchParams.get("q"),
    searchParams.get("category"),
    priceMax < 500 ? "price" : null,
    minRating > 0 ? "rating" : null,
    verifiedOnly ? "verified" : null,
  ].filter(Boolean).length;

  return (
    <div className="bg-dark-900 rounded-xl p-6 border border-white/10 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${
                (priceMax / 500) * 100
              }%, rgb(55 65 81) ${(priceMax / 500) * 100}%, rgb(55 65 81) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>$0</span>
            <span>$500+</span>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Minimum Rating
          </label>
          <div className="flex gap-2">
            {[0, 3, 4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`flex-1 px-3 py-2 rounded-lg border transition ${
                  minRating === rating
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "bg-dark-800 border-white/10 text-white/60 hover:border-white/20"
                }`}
              >
                {rating === 0 ? (
                  "Any"
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    {rating}
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    +
                  </span>
                )}
              </button>
            ))}
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

      {/* Verified Only Toggle */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <label className="flex items-center gap-3 cursor-pointer w-fit group">
          <div className="relative">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={handleVerifiedToggle}
              className="sr-only peer"
            />
            <div className={`w-14 h-7 rounded-full transition-all duration-200 ${
              verifiedOnly
                ? "bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-500/50"
                : "bg-dark-700 hover:bg-dark-600"
            }`}></div>
            <div className={`absolute left-1 top-1 w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center ${
              verifiedOnly
                ? "translate-x-7 bg-white shadow-md"
                : "translate-x-0 bg-white/80"
            }`}>
              {verifiedOnly && (
                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium transition-colors ${
              verifiedOnly ? "text-yellow-400" : "text-white/80"
            }`}>
              Show only verified mentors
            </span>
            {verifiedOnly && (
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </label>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-white/60">
              Active filters ({activeFiltersCount}):
            </span>
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
                label={searchParams.get("category")?.replace("_", " ") || ""}
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
            {minRating > 0 && (
              <FilterChip
                label={`${minRating}+ stars`}
                onRemove={() => handleRatingChange(0)}
              />
            )}
            {verifiedOnly && (
              <FilterChip
                label="Verified only"
                onRemove={handleVerifiedToggle}
              />
            )}
            <button
              onClick={() => router.push("/catalog")}
              className="text-sm text-red-400 hover:text-red-300 ml-2 transition"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-full border border-primary-500/30">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white transition text-lg leading-none"
      >
        ×
      </button>
    </span>
  );
}
