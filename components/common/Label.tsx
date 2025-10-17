// components/common/Label.tsx
import { cn } from "./cn";

type Props = React.LabelHTMLAttributes<HTMLLabelElement>;

export default function Label({ className, ...props }: Props) {
  return (
    <label
      className={cn("text-sm text-white/80", className)}
      {...props}
    />
  );
}
