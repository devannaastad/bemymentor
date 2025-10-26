// app/apply/page.tsx
import ApplyForm from "@/components/apply/ApplyForm";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/common/Card";
import { CheckCircle, DollarSign, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Mentor - BeMyMentor",
  description: "Share your expertise and earn money by becoming a mentor on BeMyMentor. Help others learn trading, gaming, design, fitness, languages, or career skills.",
  openGraph: {
    title: "Become a Mentor | BeMyMentor",
    description: "Turn your expertise into income. Join our platform as a mentor and start coaching students today.",
  },
};

export default function ApplyPage() {
  return (
    <section className="section min-h-screen">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="h1 mb-4">Become a Mentor</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Turn your expertise into income. Join BeMyMentor and start earning by teaching what you love.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card className="border-primary-500/20">
            <CardContent className="p-6">
              <div className="rounded-full bg-primary-500/20 w-12 h-12 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Earn 85%</h3>
              <p className="text-sm text-white/60">
                Keep 85% of all earnings. We only take a 15% platform fee.
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20">
            <CardContent className="p-6">
              <div className="rounded-full bg-emerald-500/20 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Global Reach</h3>
              <p className="text-sm text-white/60">
                Connect with students worldwide looking for your expertise.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardContent className="p-6">
              <div className="rounded-full bg-blue-500/20 w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Setup</h3>
              <p className="text-sm text-white/60">
                Get approved and start earning within 24-48 hours.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="border-white/10">
          <CardContent className="p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Application Form</h2>
              <p className="text-white/60">
                Fill out the form below to apply. We&apos;ll review your application and get back to you within 1-2 business days.
              </p>
            </div>

            <ApplyForm />

            {/* What Happens Next */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="font-semibold text-lg mb-4">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Application Review</p>
                    <p className="text-sm text-white/60">
                      Our team reviews your credentials and proof links
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Approval Notification</p>
                    <p className="text-sm text-white/60">
                      You&apos;ll receive an email within 1-2 business days
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Complete Profile</p>
                    <p className="text-sm text-white/60">
                      Set up your mentor profile and connect your Stripe account
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Start Earning</p>
                    <p className="text-sm text-white/60">
                      Go live and start accepting bookings from students
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
