// prisma/seed.ts
import { PrismaClient, MentorCategory, OfferType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  const mentors = [
    // TRADING
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
      badges: ["Live calls", "Risk rules", "Journaling templates"],
    },
    {
      id: "mtr-trading-002",
      name: "Marcus Chen",
      category: MentorCategory.trading,
      tagline: "Swing trader • Stocks & crypto",
      rating: 4.6,
      reviews: 94,
      offerType: OfferType.ACCESS,
      accessPrice: 15,
      hourlyRate: null,
      badges: ["Watchlist", "Entry signals"],
    },
    {
      id: "mtr-trading-003",
      name: "Sofia Martinez",
      category: MentorCategory.trading,
      tagline: "Options flow & dark pool analysis",
      rating: 4.9,
      reviews: 156,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 200,
      badges: ["Institutional insights", "Risk mgmt"],
    },

    // GAMING
    {
      id: "mtr-gaming-001",
      name: "Riley Chen",
      category: MentorCategory.gaming,
      tagline: "Valorant Radiant coach (aim + comms)",
      rating: 4.9,
      reviews: 203,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 40,
      badges: ["VOD reviews", "Aim routine", "Team comms"],
    },
    {
      id: "mtr-gaming-002",
      name: "Tyler Williams",
      category: MentorCategory.gaming,
      tagline: "League of Legends Challenger • Jungle main",
      rating: 4.7,
      reviews: 167,
      offerType: OfferType.BOTH,
      accessPrice: 25,
      hourlyRate: 50,
      badges: ["Macro guide", "Live coaching"],
    },
    {
      id: "mtr-gaming-003",
      name: "Emma Rodriguez",
      category: MentorCategory.gaming,
      tagline: "CS2 Global Elite • IGL & strat caller",
      rating: 4.8,
      reviews: 142,
      offerType: OfferType.ACCESS,
      accessPrice: 18,
      hourlyRate: null,
      badges: ["Aim maps", "Smoke lineups", "Demo review"],
    },

    // DESIGN
    {
      id: "mtr-design-001",
      name: "Maya Lopez",
      category: MentorCategory.design,
      tagline: "UX case studies that get hired",
      rating: 4.7,
      reviews: 89,
      offerType: OfferType.ACCESS,
      accessPrice: 15,
      hourlyRate: null,
      badges: ["Portfolio review", "Figma systems", "Whiteboard prep"],
    },
    {
      id: "mtr-design-002",
      name: "James Park",
      category: MentorCategory.design,
      tagline: "Product designer at FAANG • Figma master",
      rating: 4.9,
      reviews: 211,
      offerType: OfferType.BOTH,
      accessPrice: 30,
      hourlyRate: 120,
      badges: ["Design systems", "Component libraries"],
    },
    {
      id: "mtr-design-003",
      name: "Zoe Anderson",
      category: MentorCategory.design,
      tagline: "Brand designer • Freelancer making $200k/yr",
      rating: 4.6,
      reviews: 78,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 80,
      badges: ["Client acquisition", "Pricing strategy"],
    },

    // FITNESS
    {
      id: "mtr-fitness-001",
      name: "Alex Rodriguez",
      category: MentorCategory.fitness,
      tagline: "Certified PT • Body recomp specialist",
      rating: 4.8,
      reviews: 134,
      offerType: OfferType.BOTH,
      accessPrice: 12,
      hourlyRate: 60,
      badges: ["Custom programs", "Nutrition plans"],
    },
    {
      id: "mtr-fitness-002",
      name: "Sarah Kim",
      category: MentorCategory.fitness,
      tagline: "Powerlifting coach • 500+ lb deadlift",
      rating: 4.9,
      reviews: 187,
      offerType: OfferType.ACCESS,
      accessPrice: 20,
      hourlyRate: null,
      badges: ["Form checks", "Program templates"],
    },
    {
      id: "mtr-fitness-003",
      name: "Michael Chen",
      category: MentorCategory.fitness,
      tagline: "Sports medicine • Injury prevention & recovery",
      rating: 4.7,
      reviews: 92,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 100,
      badges: ["Movement screening", "Rehab protocols"],
    },

    // LANGUAGES
    {
      id: "mtr-languages-001",
      name: "Ana García",
      category: MentorCategory.languages,
      tagline: "Spanish tutor • Native from Madrid",
      rating: 4.8,
      reviews: 156,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 30,
      badges: ["Conversational practice", "DELE prep"],
    },
    {
      id: "mtr-languages-002",
      name: "Pierre Dubois",
      category: MentorCategory.languages,
      tagline: "French teacher • Lived in Paris 20 years",
      rating: 4.6,
      reviews: 103,
      offerType: OfferType.BOTH,
      accessPrice: 10,
      hourlyRate: 35,
      badges: ["Grammar guides", "Pronunciation drills"],
    },
    {
      id: "mtr-languages-003",
      name: "Yuki Tanaka",
      category: MentorCategory.languages,
      tagline: "Japanese tutor • JLPT N1 certified",
      rating: 4.9,
      reviews: 198,
      offerType: OfferType.ACCESS,
      accessPrice: 18,
      hourlyRate: null,
      badges: ["Kanji flashcards", "Anime immersion guide"],
    },

    // CAREER
    {
      id: "mtr-career-001",
      name: "David Kumar",
      category: MentorCategory.career,
      tagline: "Ex-FAANG recruiter • 500+ hires",
      rating: 4.9,
      reviews: 243,
      offerType: OfferType.BOTH,
      accessPrice: 25,
      hourlyRate: 150,
      badges: ["Resume teardown", "Mock interviews"],
    },
    {
      id: "mtr-career-002",
      name: "Rachel Thompson",
      category: MentorCategory.career,
      tagline: "Career coach • Helped 200+ land $100k+ roles",
      rating: 4.7,
      reviews: 189,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 100,
      badges: ["LinkedIn optimization", "Salary negotiation"],
    },
    {
      id: "mtr-career-003",
      name: "Chris Yang",
      category: MentorCategory.career,
      tagline: "Software engineer → Manager at Google",
      rating: 4.8,
      reviews: 167,
      offerType: OfferType.ACCESS,
      accessPrice: 20,
      hourlyRate: null,
      badges: ["System design prep", "Behavioral answers"],
    },
  ];

  let created = 0;
  let updated = 0;

  for (const mentorData of mentors) {
    const result = await prisma.mentor.upsert({
      where: { id: mentorData.id },
      update: { 
        name: mentorData.name,
        category: mentorData.category,
        tagline: mentorData.tagline,
        rating: mentorData.rating,
        reviews: mentorData.reviews,
        offerType: mentorData.offerType,
        accessPrice: mentorData.accessPrice,
        hourlyRate: mentorData.hourlyRate,
        badges: mentorData.badges,
        updatedAt: new Date() 
      },
      create: {
        id: mentorData.id,
        name: mentorData.name,
        category: mentorData.category,
        tagline: mentorData.tagline,
        rating: mentorData.rating,
        reviews: mentorData.reviews,
        offerType: mentorData.offerType,
        accessPrice: mentorData.accessPrice,
        hourlyRate: mentorData.hourlyRate,
        badges: mentorData.badges,
      },
    });
    
    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
      console.log(`  ✅ Created: ${mentorData.name} (${mentorData.category})`);
    } else {
      updated++;
      console.log(`  🔄 Updated: ${mentorData.name} (${mentorData.category})`);
    }
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   Created: ${created} mentors`);
  console.log(`   Updated: ${updated} mentors`);
  console.log(`   Total: ${mentors.length} mentors in database\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });