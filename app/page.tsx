import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Categories from "@/components/landing/Categories";
import Trust from "@/components/landing/Trust";
import CTA from "@/components/landing/CTA";
import FAQ from "@/components/landing/FAQ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BeMyMentor - Find Expert Mentors in Trading, Gaming, Design & More",
  description: "Connect with expert mentors in trading, gaming, design, fitness, languages, and career coaching. Book 1-on-1 sessions or get lifetime access to exclusive content and communities.",
  openGraph: {
    title: "BeMyMentor - Expert Mentorship Platform",
    description: "Transform your skills with personalized mentorship from industry experts. Choose from ACCESS passes or 1-on-1 sessions.",
    type: "website",
  },
  keywords: ["mentorship", "coaching", "trading mentor", "gaming coach", "design mentor", "fitness coach", "career coaching", "online learning"],
};

export default function HomePage() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(147,51,234,0.25)_0%,rgba(0,0,0,0)_60%)]" />
      <Hero />
      <HowItWorks />
      <Categories />
      <Trust />
      <CTA />
      <FAQ />
    </>
  );
}
