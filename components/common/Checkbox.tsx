// components/common/Checkbox.tsx
"use client";
import { cn } from "./cn";

export default function Checkbox({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 cursor-pointer appearance-none rounded border border-white/30 bg-white/5",
        "checked:bg-white checked:text-black",
        "focus:outline-none focus:ring-2 focus:ring-white/40",
        className
      )}
      {...props}
    />
  );
}
