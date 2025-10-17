// components/Trust.tsx
export default function Trust() {
  const items = [
    {
      title: "Verified-purchase reviews",
      desc:
        "Only real buyers can review. We prevent gaming and surface detailed feedback.",
    },
    {
      title: "Escrow for sessions",
      desc:
        "TIME orders are held until 24h after the session unless a dispute is opened.",
    },
    {
      title: "Clear refund policy",
      desc:
        "Category-based rules. ACCESS has short windows; TIME honors cancellation cutoffs.",
    },
  ];
  return (
    <section id="trust" className="section">
      <div className="container">
        <h2 className="h2">Trust & safety by design</h2>
        <p className="muted mt-2">
          Transparent rules for mentors and learners. Fast takedowns for abuse.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((x) => (
            <div key={x.title} className="card p-6">
              <h3 className="font-semibold">{x.title}</h3>
              <p className="muted mt-2 text-sm">{x.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
