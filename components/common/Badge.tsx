// components/common/Badge.tsx
import { cn } from "./cn";

type Variant = "default" | "success" | "warning" | "danger" | "outline";

const STYLES: Record<Variant, string> = {
  default: "bg-white/15 text-white",
  success: "bg-emerald-500/20 text-emerald-200",
  warning: "bg-amber-500/20 text-amber-200",
  danger: "bg-rose-500/20 text-rose-200",
  outline: "border border-white/25 text-white",
};

export default function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
