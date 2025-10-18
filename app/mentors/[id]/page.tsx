// app/mentors/[id]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import MentorCard from "@/components/catalog/MentorCard"; // reuse visual for now

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = await db.mentor.findUnique({ where: { id }, select: { name: true } });
  return {
    title: m?.name ? `${m.name} • BeMyMentor` : "Mentor • BeMyMentor",
  };
}

export default async function MentorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const mentor = await db.mentor.findUnique({
    where: { id },
  });

  if (!mentor) notFound();

  // You can replace this with a dedicated detail component later
  return (
    <section className="section">
      <div className="container">
        <h1 className="h1 mb-6">{mentor.name}</h1>
        <div className="grid gap-4">
          <MentorCard m={mentor} />
        </div>
      </div>
    </section>
  );
}
