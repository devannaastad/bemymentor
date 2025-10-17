// app/legal/privacy/page.tsx
import Prose from "@/components/common/Prose";

export default function PrivacyPage() {
  return (
    <>
      <h1 className="h1">Privacy Policy (Placeholder)</h1>
      <p className="muted mt-3">
        We collect minimal data to run the marketplace and improve the experience.
      </p>
      <Prose className="mt-8">
        <h2>What we collect</h2>
        <p>Account info, purchase history, analytics events.</p>
        <h2>What we don’t collect</h2>
        <p>No unnecessary personal data. We never sell your data.</p>
        <h2>Data deletion</h2>
        <p>Contact support to request deletion of your account data.</p>
      </Prose>
    </>
  );
}
