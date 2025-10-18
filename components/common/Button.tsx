// components/common/Button.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
};

// If href is provided, render a Link
type LinkProps = BaseProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "className"> & {
    href: string | URL;
    disabled?: boolean;
  };

// Otherwise render a button
type NativeButtonProps = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
};

export type ButtonProps = LinkProps | NativeButtonProps;

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed";
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-4 text-base",
};
const variants: Record<Variant, string> = {
  primary:
    "bg-white/10 text-neutral-100 border border-white/15 hover:bg-white/15 active:bg-white/20",
  secondary:
    "bg-transparent text-neutral-200 border border-white/15 hover:bg-white/5 active:bg-white/10",
  ghost:
    "bg-transparent text-neutral-200 hover:bg-white/5 active:bg-white/10 border border-transparent",
  danger:
    "bg-red-500/80 text-white hover:bg-red-500 active:bg-red-600 border border-red-500/40",
};

function classes(variant: Variant = "secondary", size: Size = "md", className?: string) {
  return cn(base, sizes[size], variants[variant], className);
}

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    // Link mode
    if ("href" in props && props.href !== undefined) {
      const { href, variant, size, className, children, disabled, ...rest } = props;

      // If disabled, fall back to a real <button> for proper a11y
      if (disabled) {
        return (
          <button
            ref={ref as React.Ref<HTMLButtonElement>}
            className={classes(variant, size, className)}
            disabled
            type="button"
          >
            {children}
          </button>
        );
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes(variant, size, className)}
          {...rest}
        >
          {children}
        </Link>
      );
    }

    // Native button mode
    const { variant, size, className, children, type = "button", ...rest } = props as NativeButtonProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classes(variant, size, className)}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
export default Button;
