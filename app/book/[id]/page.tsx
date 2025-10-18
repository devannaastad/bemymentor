// app/book/[id]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

type Params = { id: string };

export default async function BookPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const mentor = await db.mentor.findUnique({
    where: { id },
    select: { id: true, name: true, offerType: true, accessPrice: true, hourlyRate: true },
  });

  if (!mentor) notFound();

  return (
    <section className="section">
      <div className="container">
        <h1 className="h1 mb-4">Book {mentor.name}</h1>
        <p className="muted mb-6">Booking flow coming soon.</p>
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-sm text-white/80">Offer type: {mentor.offerType}</p>
          {mentor.accessPrice != null && (
            <p className="text-sm text-white/80">Access price: ${mentor.accessPrice}</p>
          )}
          {mentor.hourlyRate != null && (
            <p className="text-sm text-white/80">Hourly rate: ${mentor.hourlyRate}/hr</p>
          )}
        </div>
      </div>
    </section>
  );
}
