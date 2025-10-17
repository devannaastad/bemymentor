// components/common/Select.tsx
import { cn } from "./cn";

export default function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg bg-white/10 px-3 text-white outline-none ring-inset ring-0 focus:ring-2 focus:ring-white/40",
        "appearance-none bg-no-repeat pr-8",
        "[background-image:linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)]",
        "[background-position:calc(100%-18px)_50%,calc(100%-12px)_50%] [background-size:6px_6px,6px_6px]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
