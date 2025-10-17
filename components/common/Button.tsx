// components/common/Button.tsx
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-white text-black hover:bg-white/90",
  ghost: "bg-white/10 text-white hover:bg-white/20",
  outline: "border border-white/30 text-white hover:bg-white/10",
};
const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-10 px-4 rounded-xl",
  lg: "h-12 px-5 text-base rounded-xl",
};

type CommonProps = { variant?: Variant; size?: Size; className?: string; children: ReactNode; };
type AnchorProps = CommonProps & Omit<ComponentProps<typeof Link>, "className" | "href"> & { href: string };
type NativeButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

export default function Button(props: AnchorProps | NativeButtonProps) {
  const v: Variant = (props.variant ?? "primary") as Variant;
  const s: Size = (props.size ?? "md") as Size;
  const classes = cn(
    "inline-flex items-center justify-center font-medium transition-colors",
    VARIANTS[v], SIZES[s], props.className
  );

  if ("href" in props && typeof props.href === "string") {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...(linkProps as Omit<AnchorProps, "href">)}>
        {props.children}
      </Link>
    );
  }

  const buttonProps = props as NativeButtonProps;
  return (
    <button className={classes} {...buttonProps}>
      {props.children}
    </button>
  );
}
