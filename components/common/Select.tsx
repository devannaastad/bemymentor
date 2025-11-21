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
        "h-12 w-full rounded-lg border-2 border-white/20 bg-white/5 px-4 text-base text-white outline-none",
        "transition-all duration-200",
        "hover:border-white/30 hover:bg-white/10",
        "focus:border-primary-500 focus:bg-white/10 focus:ring-2 focus:ring-primary-500/20",
        "appearance-none bg-no-repeat pr-10 cursor-pointer",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Custom dropdown arrow
        "[background-image:url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27rgb(255,255,255)%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')]",
        "[background-position:right_0.75rem_center] [background-size:1.25rem]",
        // Fix option text colors for all browsers
        "[&>option]:text-black [&>option]:bg-white",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
