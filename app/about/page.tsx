import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Categories from "@/components/landing/Categories";
import Trust from "@/components/landing/Trust";
import CTA from "@/components/landing/CTA";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About BeMyMentor - Expert Mentorship Platform",
  description: "Learn about BeMyMentor - the premier mentorship platform for creators, gamers, and traders. Discover how we connect students with expert mentors.",
  openGraph: {
    title: "About BeMyMentor - Expert Mentorship Platform",
    description: "Learn how BeMyMentor connects the next generation with top Gaming & Esports pros, Trading experts, Streamers, and YouTube creators.",
    type: "website",
  },
};

export default function AboutPage() {
  // JSON-LD structured data for Google search and SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BeMyMentor",
    "url": "https://www.bemymentor.co",
    "logo": "https://www.bemymentor.co/logo.png",
    "description": "Mentorship for the next generation. Learn from top Gaming & Esports pros, Trading experts, Streamers, and YouTube creators.",
    "sameAs": [
      // Add your social media profiles here when available
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BeMyMentor",
    "url": "https://www.bemymentor.co",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.bemymentor.co/catalog?search={search_term_string}",
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
