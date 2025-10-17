// components/common/Prose.tsx
import { cn } from "./cn";

/**
 * Lightweight "prose" wrapper so we don't need @tailwindcss/typography.
 * Applies consistent spacing/typography for legal/policy content.
 */
export default function Prose({
  className,
  children,
}: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "prose-custom",
        // base styles
        "text-white/85",
        "space-y-4",
        // headings
        "[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-white",
        "[&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-white",
        "[&>h3]:text-xl  [&>h3]:font-semibold [&>h3]:text-white",
        // paragraphs & lists
        "[&>p]:leading-relaxed",
        "[&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6",
        // links
        "[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-white/20 [&_a:hover]:decoration-white",
        className
      )}
    >
      {children}
    </div>
  );
}
