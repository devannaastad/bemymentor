// components/common/Input.tsx
import * as React from "react";
import { cn } from "./cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-10 w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none ring-inset ring-0 focus:ring-2 focus:ring-white/40",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
