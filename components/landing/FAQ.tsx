// components/FAQ.tsx
const QA = [
  {
    q: "How are mentors vetted?",
    a: "Mentors submit proof (portfolios, ranks, samples) and complete KYC via Stripe Connect. Ops approves before publishing.",
  },
  {
    q: "What’s the difference between ACCESS and TIME?",
    a: "ACCESS = digital asset (guides, strategies). TIME = live sessions. Payments and refunds follow different rules per type.",
  },
  {
    q: "What’s your refund policy?",
    a: "ACCESS has a short window (e.g., 24h if not downloaded). TIME supports cancellations before the cutoff and disputes within 24h after sessions.",
  },
];

export default function FAQ() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="h2">FAQ</h2>
        <div className="mt-6 grid gap-4">
          {QA.map((item) => (
            <details key={item.q} className="card p-5">
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <p className="muted mt-2 text-sm">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
