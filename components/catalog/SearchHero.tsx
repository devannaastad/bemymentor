"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const EXAMPLES = [
  "Valorant coaching",
  "Options trading",
  "YouTube thumbnails",
  "Twitch growth",
  "Rocket League",
];

const CATEGORIES = [
  { value: "ECOMMERCE", label: "Ecommerce" },
  { value: "AGENCIES", label: "Agencies" },
  { value: "TRADING_INVESTING", label: "Trading & Investing" },
  { value: "STREAMING_CONTENT", label: "Streaming" },
  { value: "YOUTUBE_PRODUCTION", label: "YouTube" },
  { value: "GAMING_ESPORTS", label: "Gaming & Esports" },
  { value: "GYMFITNESS", label: "Gym & Fitness" },
  { value: "OTHER", label: "Other" },
];

// Common search terms for autocomplete
const COMMON_SEARCHES = [
  // Trading & Investing
  "Trading options",
  "Trading strategies",
  "Trading forex",
  "Trading crypto",
  "Trading stocks",
  "Day trading",
  "Swing trading",
  "Options trading strategies",
  "Technical analysis",
  "Chart patterns",
  "Crypto trading",
  "Bitcoin trading",
  "Ethereum trading",
  "Cryptocurrency investing",
  "Stock market analysis",
  "Forex trading strategies",
  "Options strategies",
  "Risk management trading",
  "Trading psychology",
  "Algorithmic trading",

  // Gaming & Esports
  "Valorant coaching",
  "Valorant aim training",
  "Valorant ranked tips",
  "Valorant agent guides",
  "Rocket League coaching",
  "Rocket League mechanics",
  "Rocket League aerial training",
  "League of Legends coaching",
  "League of Legends jungle guide",
  "League of Legends mid lane",
  "CS:GO coaching",
  "Counter-Strike tips",
  "Fortnite coaching",
  "Fortnite building",
  "Apex Legends coaching",
  "Call of Duty coaching",
  "Gaming coaching",
  "Esports coaching",
  "FPS coaching",
  "MOBA coaching",
  "Game sense training",
  "Competitive gaming",

  // YouTube & Content Creation
  "YouTube thumbnail design",
  "YouTube editing",
  "YouTube growth",
  "YouTube SEO",
  "YouTube monetization",
  "YouTube algorithm",
  "YouTube shorts",
  "Video editing",
  "Video production",
  "Content creation",
  "Video editing tips",
  "Adobe Premiere Pro",
  "Final Cut Pro",
  "DaVinci Resolve",
  "Color grading",
  "Motion graphics",
  "YouTube analytics",
  "Viral content creation",
  "Storytelling for YouTube",

  // Twitch & Streaming
  "Twitch streaming setup",
  "Twitch growth strategies",
  "Stream overlay design",
  "OBS setup",
  "Streaming tips",
  "Twitch monetization",
  "Stream engagement",
  "Stream quality improvement",
  "Streaming equipment",
  "Chat interaction",
  "Viewer retention",
  "Live streaming",

  // Ecommerce & Marketing
  "Ecommerce dropshipping",
  "Ecommerce marketing",
  "Shopify store setup",
  "Product research",
  "Facebook ads",
  "Google ads",
  "Instagram marketing",
  "TikTok marketing",
  "Email marketing",
  "Social media marketing",
  "Influencer marketing",
  "Brand building",
  "Digital marketing",
  "SEO optimization",
  "Content marketing",
  "Affiliate marketing",
  "Amazon FBA",
  "Product photography",
  "Conversion optimization",

  // Agency & Business
  "Agency growth",
  "Client acquisition",
  "Sales strategies",
  "Business consulting",
  "Marketing agency",
  "Lead generation",
  "Cold outreach",
  "Email campaigns",
  "Client retention",
  "Project management",

  // Fitness & Health
  "Personal training",
  "Workout programming",
  "Nutrition coaching",
  "Weight loss coaching",
  "Muscle building",
  "Strength training",
  "Bodybuilding coaching",
  "CrossFit training",
  "Yoga instruction",
  "Meal planning",

  // Creative & Design
  "Graphic design",
  "Logo design",
  "Brand design",
  "UI/UX design",
  "Web design",
  "Photoshop tutorials",
  "Illustrator tutorials",
  "Digital art",
  "Animation",
  "3D modeling",

  // General Skills
  "Programming tutoring",
  "Music production",
  "Photography",
  "Writing coaching",
  "Public speaking",
  "Career coaching",
  "Interview preparation",
  "Resume building",
  "Entrepreneurship",
  "Time management",
];

// Get autocomplete suggestions based on query
function getAutocompleteSuggestions(searchQuery: string): string[] {
  if (!searchQuery || searchQuery.length < 2) return [];

  const lower = searchQuery.toLowerCase();
  const matches = COMMON_SEARCHES.filter(term =>
    term.toLowerCase().includes(lower)
  );

  return matches.slice(0, 8); // Show max 8 suggestions
}

export default function SearchHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch suggestions or use autocomplete
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      // First, try autocomplete from common searches
      const autocompleteSuggestions = getAutocompleteSuggestions(query);
      setSuggestions(autocompleteSuggestions);

      // Optionally, also fetch from API (commented out for now)
      // try {
      //   const res = await fetch(
      //     `/api/search-suggestions?q=${encodeURIComponent(query)}`
      //   );
      //   const data = await res.json();
      //   setSuggestions(data.suggestions || []);
      // } catch (error) {
      //   console.error("Failed to fetch suggestions:", error);
      //   setSuggestions([]);
      // }
    };

    const debounce = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounce);
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = (categoryLabel: string) => {
    setQuery(categoryLabel);
    setShowSuggestions(false);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    const params = new URLSearchParams(searchParams.toString());
    if (finalQuery.trim()) {
      params.set("q", finalQuery.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSearch(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-900/20 to-primary-800/10 border border-primary-500/20 rounded-2xl p-8 mb-8">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        What do you want to learn?
      </h2>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="relative" ref={searchRef}>
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={`e.g., "${EXAMPLES[placeholderIndex]}"`}
            className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
          />

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent input blur before click registers
                    e.preventDefault();
                    handleSearch(suggestion);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition cursor-pointer ${
                    index === selectedIndex
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      <div className="flex gap-2 justify-center mt-4 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryClick(cat.label)}
            className="text-sm text-primary-400 hover:text-primary-300 transition px-3 py-1 rounded-full hover:bg-primary-500/10"
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
