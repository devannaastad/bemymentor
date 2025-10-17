// prisma/seed.ts
import { PrismaClient, MentorCategory, OfferType } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.mentor.deleteMany();
  await prisma.mentor.createMany({
    data: [
      {
        id: "m1",
        name: "Alex Rivera",
        category: MentorCategory.trading,
        tagline: "Day-trading momentum with risk first",
        rating: 4.8,
        reviews: 312,
        offerType: OfferType.BOTH,
        accessPrice: 20,
        hourlyRate: 120,
        badges: ["Top Rated", "Fast replies"] as any,
      },
      {
        id: "m2",
        name: "Kara Nguyen",
        category: MentorCategory.gaming,
        tagline: "Valorant Immortal coach — aim & comms",
        rating: 4.9,
        reviews: 189,
        offerType: OfferType.TIME,
        hourlyRate: 35,
        badges: ["Proven results"] as any,
      },
      {
        id: "m3",
        name: "Mason Lee",
        category: MentorCategory.design,
        tagline: "Figma systems & portfolio reviews",
        rating: 4.7,
        reviews: 142,
        offerType: OfferType.BOTH,
        accessPrice: 15,
        hourlyRate: 90,
      },
    ],
  });
  console.log("Seeded mentors ✔");
}

main().finally(() => prisma.$disconnect());
