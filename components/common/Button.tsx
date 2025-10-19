// components/common/Button.tsx
import Link from "next/link";
import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Spinner from "./Spinner";

type BaseButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
};

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    href?: never;
  };

type ButtonAsLink = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ children, variant = "secondary", size = "md", loading = false, className = "", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-white text-black hover:bg-white/90 active:bg-white/80",
      secondary: "bg-white/10 text-white hover:bg-white/15 active:bg-white/20",
      ghost: "text-white/70 hover:bg-white/5 hover:text-white",
      danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const content = loading ? (
      <>
        <Spinner size="sm" />
        Loading...
      </>
    ) : (
      children
    );

    if ("href" in props && props.href) {
      return (
        <Link href={props.href} className={classes} ref={ref as React.Ref<HTMLAnchorElement>}>
          {content}
        </Link>
      );
    }

    const { disabled, type = "button", onClick, ...buttonProps } = props as ButtonAsButton;

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={classes}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;