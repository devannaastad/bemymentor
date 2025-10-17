import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Categories from "@/components/landing/Categories";
import Trust from "@/components/landing/Trust";
import CTA from "@/components/landing/CTA";
import FAQ from "@/components/landing/FAQ";

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
