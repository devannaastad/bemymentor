// components/common/Divider.tsx
import { cn } from "./cn";

export default function Divider({ className }: { className?: string }) {
  return <hr className={cn("my-6 border-white/10", className)} />;
}
