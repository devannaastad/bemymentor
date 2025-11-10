import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - BeMyMentor",
  description: "Privacy Policy for BeMyMentor platform",
};

export default function PrivacyPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-6 text-sm text-muted-foreground">Last updated: October 27, 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              BeMyMentor (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is committed to protecting your personal
              data. This Privacy Policy explains how we collect, use, and safeguard your information when you use
              our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold mb-3 mt-4">Account Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and email address (via Google OAuth or GitHub OAuth)</li>
              <li>Profile picture</li>
              <li>User preferences and settings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Mentor Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Professional credentials and proof of expertise</li>
              <li>Portfolio items and work samples</li>
              <li>Stripe Connect account information (for payouts)</li>
              <li>Availability and scheduling preferences</li>
              <li>Video introductions and content uploads</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Booking and Payment Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Booking details (session times, types, status)</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Transaction history</li>
              <li>Session confirmations and reviews</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pages visited and features used</li>
              <li>Time spent on the platform</li>
              <li>Browser type and device information</li>
              <li>IP address and location data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide and improve our mentorship platform services</li>
              <li>Process bookings and payments</li>
              <li>Connect students with mentors</li>
              <li>Send booking confirmations and important updates</li>
              <li>Verify mentor credentials and maintain platform quality</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            <p>We share your information only in the following circumstances:</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">With Other Users</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Students can see mentor public profiles, portfolios, and reviews</li>
              <li>Mentors can see student names and booking details for confirmed sessions</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">With Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> Payment processing and mentor payouts</li>
              <li><strong>UploadThing:</strong> File storage for portfolios and content</li>
              <li><strong>Neon/Vercel:</strong> Database and hosting services</li>
              <li><strong>Resend:</strong> Transactional email delivery</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Legal Requirements</h3>
            <p className="mt-2">
              We may disclose your information if required by law, legal process, or to protect the rights,
              property, or safety of BeMyMentor, our users, or the public.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>SSL/TLS encryption for data in transit</li>
              <li>Encrypted database storage</li>
              <li>Secure OAuth authentication (Google/GitHub)</li>
              <li>PCI-compliant payment processing through Stripe</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to maintain your session, remember your preferences, and
              analyze platform usage. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@bemymentor.dev" className="text-purple-400 hover:text-purple-300">
                privacy@bemymentor.dev
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide services.
              After account deletion, we may retain certain information for legal compliance, fraud prevention,
              and dispute resolution purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
            <p>
              BeMyMentor is not intended for users under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you believe we have collected such information, please contact
              us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure
              appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via
              email or platform notification. Continued use after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p>
              For questions about this Privacy Policy or our data practices, contact us at:
            </p>
            <ul className="list-none mt-2 space-y-1">
              <li>
                Email:{" "}
                <a href="mailto:privacy@bemymentor.dev" className="text-purple-400 hover:text-purple-300">
                  privacy@bemymentor.dev
                </a>
              </li>
              <li>
                Support:{" "}
                <a href="mailto:support@bemymentor.dev" className="text-purple-400 hover:text-purple-300">
                  support@bemymentor.dev
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
