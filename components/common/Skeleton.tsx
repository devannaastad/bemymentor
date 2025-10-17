// components/common/Skeleton.tsx
import { cn } from "./cn";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-full animate-pulse rounded-md bg-white/10",
        className
      )}
    />
  );
}
