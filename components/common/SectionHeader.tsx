// components/common/SectionHeader.tsx
export default function SectionHeader({
  title,
  subtitle,
}: { title: string; subtitle?: string }) {
  return (
    <div className="container">
      <h1 className="h1">{title}</h1>
      {subtitle && <p className="muted mt-3 max-w-2xl">{subtitle}</p>}
    </div>
  );
}
