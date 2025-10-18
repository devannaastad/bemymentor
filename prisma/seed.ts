// prisma/seed.ts//
import { PrismaClient, MentorCategory, OfferType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const mentors = [
    {
      id: "mtr-trading-001",
      name: "Ava Thompson",
      category: MentorCategory.trading,
      tagline: "Price-action scalper with 62% WR",
      rating: 4.8,
      reviews: 128,
      offerType: OfferType.BOTH,
      accessPrice: 20,
      hourlyRate: 150,
      badges: { highlights: ["Live calls", "Risk rules", "Journaling templates"] },
    },
    {
      id: "mtr-gaming-001",
      name: "Riley Chen",
      category: MentorCategory.gaming,
      tagline: "Valorant Radiant coach (aim + comms)",
      rating: 4.9,
      reviews: 203,
      offerType: OfferType.TIME,
      hourlyRate: 40,
      badges: { highlights: ["VOD reviews", "Aim routine", "Team comms"] },
    },
    {
      id: "mtr-design-001",
      name: "Maya Lopez",
      category: MentorCategory.design,
      tagline: "UX case studies that get hired",
      rating: 4.7,
      reviews: 89,
      offerType: OfferType.ACCESS,
      accessPrice: 15,
      badges: { highlights: ["Portfolio review", "Figma systems", "Whiteboard prep"] },
    },
  ];

  for (const m of mentors) {
    await prisma.mentor.upsert({
      where: { id: m.id },
      update: { ...m, updatedAt: new Date() },
      create: m,
    });
  }

  console.log(`Seeded ${mentors.length} mentors ✅`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
