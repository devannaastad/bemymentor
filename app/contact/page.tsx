import type { Metadata } from "next";
import { Mail, MessageCircle, Shield, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/common/Card";

export const metadata: Metadata = {
  title: "Contact & Support - BeMyMentor",
  description: "Get help and contact the BeMyMentor support team",
};

export default function ContactPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="mb-4 text-4xl font-bold">Contact & Support</h1>
          <p className="text-lg text-muted-foreground">
            We&apos;re here to help! Reach out to us with any questions or concerns.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                  <Mail className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">General Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    For general questions, account issues, or platform help
                  </p>
                  <a
                    href="mailto:support@bemymentor.com"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    support@bemymentor.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                  <MessageCircle className="h-6 w-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Booking Issues</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Problems with sessions, payments, or scheduling
                  </p>
                  <a
                    href="mailto:bookings@bemymentor.com"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    bookings@bemymentor.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                  <Shield className="h-6 w-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Report Abuse or Fraud</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Report violations, scams, or suspicious activity
                  </p>
                  <a
                    href="mailto:abuse@bemymentor.com"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    abuse@bemymentor.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                  <HelpCircle className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Become a Mentor</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Questions about applying or mentor requirements
                  </p>
                  <a
                    href="mailto:mentors@bemymentor.com"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    mentors@bemymentor.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How quickly will I get a response?</h3>
                <p className="text-sm text-muted-foreground">
                  We aim to respond to all inquiries within 24 hours. Urgent booking issues are prioritized and
                  typically handled within a few hours.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">What should I include in my support email?</h3>
                <p className="text-sm text-muted-foreground">
                  Please include your account email, a detailed description of the issue, relevant booking IDs or
                  mentor names, and any screenshots that might help us understand the problem.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Can I get a refund?</h3>
                <p className="text-sm text-muted-foreground">
                  Refund policies vary by booking type. ACCESS passes have a 24-hour refund window if content
                  hasn&apos;t been accessed. TIME sessions can be cancelled for a full refund if cancelled 24+ hours
                  before the scheduled time. See our{" "}
                  <a href="/terms" className="text-purple-400 hover:text-purple-300">
                    Terms of Service
                  </a>{" "}
                  for details.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">How do I delete my account?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact us at support@bemymentor.com with your account deletion request. We&apos;ll process it within
                  48 hours. Note that active ACCESS passes will remain valid after deletion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            For legal matters or privacy concerns, contact{" "}
            <a href="mailto:legal@bemymentor.com" className="text-purple-400 hover:text-purple-300">
              legal@bemymentor.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
