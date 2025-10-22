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
      primary: "text-black hover:scale-[1.02]",
      secondary: "text-black hover:scale-[1.02]",
      ghost: "bg-white/10 text-white hover:bg-white/15 border border-white/20",
      danger: "bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:shadow-lg hover:scale-[1.02]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const getGradientStyle = (): React.CSSProperties | undefined => {
      if (variant === "primary") {
        return {
          background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
          boxShadow: "0 4px 6px -1px rgba(245, 158, 11, 0.5), 0 2px 4px -1px rgba(245, 158, 11, 0.06)",
        };
      }
      if (variant === "secondary") {
        return {
          background: "linear-gradient(135deg, #eab308 0%, #fde047 100%)",
          boxShadow: "0 4px 6px -1px rgba(234, 179, 8, 0.5), 0 2px 4px -1px rgba(234, 179, 8, 0.06)",
        };
      }
      return undefined;
    };

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
        <Link href={props.href} className={classes} style={getGradientStyle()} ref={ref as React.Ref<HTMLAnchorElement>}>
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
        style={getGradientStyle()}
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