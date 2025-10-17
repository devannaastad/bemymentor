// app/legal/layout.tsx
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="container md:max-w-3xl">{children}</div>
    </section>
  );
}
