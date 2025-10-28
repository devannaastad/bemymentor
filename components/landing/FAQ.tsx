"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/common/Card";

const QA = [
  {
    q: "How are mentors vetted?",
    a: "Every mentor submits proof of expertise (portfolios, rank screenshots, sample work) and completes KYC verification through Stripe Connect. Our team manually reviews each application to ensure quality before approval. Only verified, legitimate experts make it onto our platform.",
  },
  {
    q: "What's the difference between ACCESS and TIME?",
    a: "ACCESS passes give you lifetime access to a mentor's exclusive content - Discord servers, guides, resources, and community. TIME bookings are live 1-on-1 coaching sessions scheduled at a specific time. Choose ACCESS for ongoing learning, or TIME for personalized coaching.",
  },
  {
    q: "What's your refund policy?",
    a: "For ACCESS passes: You have 24 hours to request a refund if you haven't accessed the content. For TIME sessions: Cancel up to 24 hours before your session for a full refund. If a session doesn't happen as agreed, you can dispute within 24 hours for a full refund. We protect both students and mentors.",
  },
  {
    q: "How do mentors get paid?",
    a: "Mentors keep 85% of every sale - one of the highest rates in the industry. For new mentors (under 5 verified bookings), payouts are held for 7 days as an anti-fraud measure. Once you become a trusted mentor, you get instant payouts after students confirm session completion.",
  },
  {
    q: "Can I save my favorite mentors?",
    a: "Yes! Create an account and click the heart icon on any mentor's profile to save them. Your saved mentors are accessible from your dashboard, making it easy to return to mentors you're interested in learning from.",
  },
  {
    q: "What categories do you focus on?",
    a: "We specialize in the Digital Creator Economy: Gaming & Esports (Valorant, Rocket League, competitive coaching), Trading & Investing (crypto, options, technical analysis), Streaming & Content Creation (Twitch, YouTube Live growth), and YouTube Production (editing, thumbnails, branding).",
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <Card
      className="cursor-pointer border-white/10 transition-all hover:border-purple-500/30"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{question}</h3>
          <ChevronDown
            className={`h-5 w-5 flex-shrink-0 text-purple-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <p className="mt-4 text-white/70 leading-relaxed">{answer}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section relative">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.1),transparent_70%)]" />

      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="text-purple-200">Got Questions?</span>
          </div>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Everything you need to know about how BeMyMentor works
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {QA.map((item, index) => (
            <FAQItem
              key={index}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/60">Still have questions?</p>
          <a
            href="mailto:support@bemymentor.com"
            className="mt-2 inline-block text-lg font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  );
}
