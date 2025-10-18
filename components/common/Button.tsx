//components/common/Button.tsx//
"use client";

import * as React from "react";

type Variant = "primary" | "ghost";
type Size = "md" | "lg";

type Common = {
  className?: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
};

type AnchorProps = Common & React.ComponentPropsWithoutRef<"a"> & { href: string };
type ButtonProps = Common & React.ComponentPropsWithoutRef<"button"> & { href?: undefined };

function baseClasses(variant: Variant, size: Size, disabled?: boolean) {
  const v =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90"
      : "bg-white/5 text-white hover:bg-white/10";
  const s = size === "lg" ? "h-11 px-5 text-base" : "h-10 px-4 text-sm";
  // noticeable press + focus ring
  const interactivity =
    "transition-transform duration-75 active:translate-y-[1px] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";
  const state = disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer";
  const frame = "inline-flex items-center justify-center rounded-xl font-medium";
  return [frame, v, s, interactivity, state].join(" ");
}

export default function Button(props: AnchorProps | ButtonProps) {
  const { variant = "primary", size = "md", className, children, disabled } = props as Common;

  if ("href" in props && props.href) {
    const { href, ...rest } = props as AnchorProps;
    return (
      <a
        {...rest}
        href={href}
        aria-disabled={disabled}
        className={[baseClasses(variant, size, disabled), className].filter(Boolean).join(" ")}
      >
        {children}
      </a>
    );
  }

  const btn = props as ButtonProps;
  return (
    <button
      {...btn}
      disabled={disabled}
      className={[baseClasses(variant, size, disabled), className].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
