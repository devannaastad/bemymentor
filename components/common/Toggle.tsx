// components/common/Toggle.tsx
"use client";
import { cn } from "./cn";

export default function Toggle({
  checked,
  onChange,
  className,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-white" : "bg-white/20",
        className
      )}
      aria-pressed={checked}
      aria-label={label}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-black transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
