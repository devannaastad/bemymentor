// app/legal/tos/page.tsx
import Prose from "@/components/common/Prose";

export default function TermsPage() {
  return (
    <>
      <h1 className="h1">Terms of Service (Placeholder)</h1>
      <p className="muted mt-3">
        These terms describe your rights and responsibilities when using BeMyMentor.
      </p>
      <Prose className="mt-8">
        <h2>Marketplace</h2>
        <p>We connect buyers with mentors. We don’t guarantee outcomes.</p>
        <h2>Payments</h2>
        <p>Payments are processed by Stripe. Platform fees apply.</p>
        <h2>Content & Conduct</h2>
        <p>No illegal, hateful, or adult content. We may remove content at our discretion.</p>
      </Prose>
    </>
  );
}
