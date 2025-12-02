"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "GAMING_ESPORTS", label: "Gaming & Esports" },
  { value: "TRADING_INVESTING", label: "Trading & Investing" },
  { value: "STREAMING_CONTENT", label: "Streaming" },
  { value: "YOUTUBE_PRODUCTION", label: "YouTube" },
  { value: "ECOMMERCE", label: "Ecommerce" },
  { value: "AGENCIES", label: "Agencies" },
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
    params.delete("page");
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
              ? "bg-primary-500 text-white shadow-lg shadow-primary-500/50"
              : "bg-dark-800 text-white/70 hover:bg-dark-700 hover:text-white border border-white/10"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
