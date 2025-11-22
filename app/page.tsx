import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Categories from "@/components/landing/Categories";
import Trust from "@/components/landing/Trust";
import CTA from "@/components/landing/CTA";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BeMyMentor - Level Up Your Skills with Expert Creators, Gamers & Traders",
  description: "Mentorship for the next generation. Learn from top Gaming & Esports pros, Trading experts, Streamers, and YouTube creators. Get 1-on-1 coaching or exclusive content access.",
  openGraph: {
    title: "BeMyMentor - Expert Mentorship for Creators, Gamers & Traders",
    description: "Level up your game. Learn from Radiant Valorant coaches, successful crypto traders, Twitch Partners, and YouTube pros.",
    type: "website",
  },
  keywords: ["gaming coach", "esports mentor", "trading mentor", "crypto trading", "twitch streaming", "youtube creator", "content creation", "valorant coach", "rocket league coach"],
};

export default function HomePage() {
  // JSON-LD structured data for Google search
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BeMyMentor",
    "url": "https://www.bemymentor.dev",
    "logo": "https://www.bemymentor.dev/logo.png",
    "description": "Mentorship for the next generation. Learn from top Gaming & Esports pros, Trading experts, Streamers, and YouTube creators.",
    "sameAs": [
      // Add your social media profiles here when available
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BeMyMentor",
    "url": "https://www.bemymentor.dev",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.bemymentor.dev/catalog?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {/* JSON-LD for Google Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(147,51,234,0.25)_0%,rgba(0,0,0,0)_60%)]" />
      <Hero />
      <HowItWorks />
      <Categories />
      <Trust />
      <CTA />
      <FAQ />
      <Footer />
    </>
  );
}
