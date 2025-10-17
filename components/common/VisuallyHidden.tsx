// components/common/VisuallyHidden.tsx
export default function VisuallyHidden({
  children,
}: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}
