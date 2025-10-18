// app/saved/loading.tsx
import MentorCardShimmer from "@/components/catalog/MentorCardShimmer";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-48 rounded bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MentorCardShimmer key={i} />
        ))}
      </div>
    </div>
  );
}
