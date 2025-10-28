import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - BeMyMentor",
  description: "Terms of Service for BeMyMentor platform",
};

export default function TermsPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
        <p className="mb-6 text-sm text-muted-foreground">Last updated: October 27, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using BeMyMentor (&quot;the Platform&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              BeMyMentor is a marketplace platform that connects students with mentors in gaming, trading, streaming,
              and content creation. We offer two types of services:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>ACCESS Passes:</strong> Lifetime access to exclusive mentor content, communities, and resources</li>
              <li><strong>TIME Sessions:</strong> Live 1-on-1 coaching sessions scheduled at specific times</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your account information is accurate and up-to-date</li>
              <li>Immediately notifying us of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Payments and Refunds</h2>
            <p className="mb-2"><strong>For Students:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>All payments are processed securely through Stripe</li>
              <li>ACCESS passes: 24-hour refund window if content has not been accessed</li>
              <li>TIME sessions: Full refund if cancelled 24+ hours before scheduled time</li>
              <li>Disputes must be filed within 24 hours of session completion</li>
            </ul>
            <p className="mb-2"><strong>For Mentors:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mentors receive 85% of all booking revenue</li>
              <li>New mentors (under 5 verified bookings): 7-day payout hold</li>
              <li>Trusted mentors: Instant payouts after student confirmation</li>
              <li>Payouts processed via Stripe Connect</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Mentor Verification</h2>
            <p>All mentors must:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Complete KYC verification through Stripe Connect</li>
              <li>Provide proof of expertise (portfolios, rank screenshots, sample work)</li>
              <li>Pass manual review by our team before approval</li>
              <li>Maintain accurate and honest representation of their skills</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Session Completion and Disputes</h2>
            <p>
              For TIME sessions, both mentors and students must confirm completion. Students have 72 hours to confirm
              or dispute a session. Auto-confirmation occurs if no action is taken. Disputed sessions are held for
              administrative review.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Prohibited Activities</h2>
            <p>Users may not:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Engage in fraudulent activities or chargebacks</li>
              <li>Share account credentials or transfer ACCESS passes</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Provide false or misleading information</li>
              <li>Attempt to circumvent payment systems</li>
              <li>Use the platform for illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p>
              Mentors retain ownership of their content. By uploading content to the Platform, mentors grant
              BeMyMentor a license to display, distribute, and promote that content. Students may not redistribute,
              resell, or share ACCESS pass content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p>
              BeMyMentor is a marketplace platform. We do not guarantee the quality of mentorship or outcomes.
              Mentors are independent contractors. We are not liable for disputes between users, quality of
              sessions, or any damages resulting from use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms. Users may delete
              their accounts at any time. Active ACCESS passes remain valid after account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Platform after changes constitutes
              acceptance of the new Terms. We will notify users of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@bemymentor.com" className="text-purple-400 hover:text-purple-300">
                legal@bemymentor.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
