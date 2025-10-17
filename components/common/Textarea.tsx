// components/common/Textarea.tsx
import * as React from "react";
import { cn } from "./cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none ring-inset ring-0 focus:ring-2 focus:ring-white/40",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export default Textarea;
