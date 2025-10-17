// components/HowItWorks.tsx
export default function HowItWorks() {
  const steps = [
    {
      title: "1) Browse & filter",
      desc:
        "Search by category, price, rating, and language. Read verified-purchase reviews.",
    },
    {
      title: "2) Buy access or book time",
      desc:
        "Choose a digital asset (ACCESS) or a live session (TIME). Pay securely with Stripe.",
    },
    {
      title: "3) Get delivery & review",
      desc:
        "Assets unlock instantly; sessions include reminders. Leave an honest review after.",
    },
  ];
  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <h2 className="h2">How it works</h2>
        <p className="muted mt-2">
          A marketplace built for trust, speed, and clarity.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="card p-6">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="muted mt-2 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
