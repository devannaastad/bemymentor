// prisma/seed.ts
import { PrismaClient, MentorCategory, OfferType } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const mentors = [
    // TRADING
    {
      id: "mtr-trading-001",
      name: "Alex Thompson",
      email: "alex.thompson@seed.internal",
      category: MentorCategory.trading,
      tagline: "Crypto trader • $2M+ profit in 2024",
      bio: "Professional cryptocurrency trader with over 5 years of experience in the markets.",
      rating: 4.9,
      reviews: 234,
      offerType: OfferType.BOTH,
      accessPrice: 49,
      hourlyRate: 200,
      badges: ["Top performer", "Verified results"],
      isActive: true,
    },
    {
      id: "mtr-trading-002",
      name: "Sarah Chen",
      email: "sarah.chen@seed.internal",
      category: MentorCategory.trading,
      tagline: "Options strategist • Ex-Goldman Sachs",
      bio: "Former Goldman Sachs trader specializing in options strategies.",
      rating: 4.8,
      reviews: 187,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 300,
      badges: ["Wall Street veteran"],
      isActive: true,
    },

    // GAMING
    {
      id: "mtr-gaming-001",
      name: "Tyler 'Ninja' Blevins",
      email: "tyler.ninja@seed.internal",
      category: MentorCategory.gaming,
      tagline: "Valorant Radiant • Former pro player",
      bio: "Professional Valorant player and coach.",
      rating: 4.7,
      reviews: 156,
      offerType: OfferType.BOTH,
      accessPrice: 29,
      hourlyRate: 100,
      badges: ["Radiant rank", "Tournament winner"],
      isActive: true,
    },

    // DESIGN
    {
      id: "mtr-design-001",
      name: "Emma Rodriguez",
      email: "emma.rodriguez@seed.internal",
      category: MentorCategory.design,
      tagline: "Senior UX at Airbnb • 10+ years experience",
      bio: "Senior UX designer at Airbnb with a decade of experience.",
      rating: 4.9,
      reviews: 203,
      offerType: OfferType.ACCESS,
      accessPrice: 39,
      hourlyRate: null,
      badges: ["Figma expert", "Design systems"],
      isActive: true,
    },

    // FITNESS
    {
      id: "mtr-fitness-001",
      name: "Marcus Williams",
      email: "marcus.williams@seed.internal",
      category: MentorCategory.fitness,
      tagline: "Certified PT • Transformed 500+ clients",
      bio: "Certified personal trainer who has helped over 500 clients transform their bodies.",
      rating: 4.8,
      reviews: 312,
      offerType: OfferType.BOTH,
      accessPrice: 19,
      hourlyRate: 80,
      badges: ["NASM certified", "Nutrition specialist"],
      isActive: true,
    },

    // LANGUAGES
    {
      id: "mtr-languages-001",
      name: "Ana García",
      email: "ana.garcia@seed.internal",
      category: MentorCategory.languages,
      tagline: "Spanish tutor • Native from Madrid",
      bio: "Native Spanish speaker from Madrid with 8 years of teaching experience.",
      rating: 4.8,
      reviews: 156,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 30,
      badges: ["Conversational practice", "DELE prep"],
      isActive: true,
    },

    // CAREER
    {
      id: "mtr-career-001",
      name: "David Kumar",
      email: "david.kumar@seed.internal",
      category: MentorCategory.career,
      tagline: "Ex-FAANG recruiter • 500+ hires",
      bio: "Former FAANG recruiter who has conducted over 500 successful hires.",
      rating: 4.9,
      reviews: 243,
      offerType: OfferType.BOTH,
      accessPrice: 25,
      hourlyRate: 150,
      badges: ["Resume teardown", "Mock interviews"],
      isActive: true,
    },
  ];

  for (const mentorData of mentors) {
    // Create a user for this mentor
    const user = await db.user.upsert({
      where: { email: mentorData.email },
      update: {},
      create: {
        name: mentorData.name,
        email: mentorData.email,
      },
    });

    console.log(`✅ Created user: ${user.email}`);

    // Create the mentor profile
    await db.mentor.upsert({
      where: { id: mentorData.id },
      update: {
        name: mentorData.name,
        category: mentorData.category,
        tagline: mentorData.tagline,
        bio: mentorData.bio,
        rating: mentorData.rating,
        reviews: mentorData.reviews,
        offerType: mentorData.offerType,
        accessPrice: mentorData.accessPrice,
        hourlyRate: mentorData.hourlyRate,
        badges: mentorData.badges,
        isActive: mentorData.isActive,
      },
      create: {
        id: mentorData.id,
        userId: user.id,
        name: mentorData.name,
        category: mentorData.category,
        tagline: mentorData.tagline,
        bio: mentorData.bio,
        rating: mentorData.rating,
        reviews: mentorData.reviews,
        offerType: mentorData.offerType,
        accessPrice: mentorData.accessPrice,
        hourlyRate: mentorData.hourlyRate,
        badges: mentorData.badges,
        isActive: mentorData.isActive,
      },
    });

    console.log(`✅ Seeded mentor: ${mentorData.name}`);
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });