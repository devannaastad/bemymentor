// app/legal/refunds/page.tsx
import Prose from "@/components/common/Prose";

export default function RefundsPage() {
  return (
    <>
      <h1 className="h1">Refunds & Disputes (Placeholder)</h1>
      <p className="muted mt-3">Clear rules help protect both learners and mentors.</p>
      <Prose className="mt-8">
        <h2>ACCESS (digital assets)</h2>
        <p>Short window (e.g., 24h) if not downloaded/streamed.</p>
        <h2>TIME (live sessions)</h2>
        <p>Free cancellation before cutoff; disputes allowed within 24h after the session.</p>
        <h2>Process</h2>
        <p>Open a dispute from your order. We review evidence and decide quickly.</p>
      </Prose>
    </>
  );
}
