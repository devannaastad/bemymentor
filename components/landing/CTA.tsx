// components/landing/CTA.tsx
import Button from "@/components/common/Button";

export default function CTA() {
  return (
    <section className="section">
      <div className="container rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur md:flex md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Ready to get started?</h3>
          <p className="muted mt-1">
            Browse mentors or apply to become one—MVP rolling out now.
          </p>
        </div>
        <div className="mt-4 flex gap-3 md:mt-0">
          <Button href="/catalog">Find a mentor</Button>
          <Button href="/apply" variant="ghost">Become a mentor</Button>
        </div>
      </div>
    </section>
  );
}
