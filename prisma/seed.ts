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
      bio: "Professional cryptocurrency trader with over 5 years of experience in the markets. Specializing in technical analysis, risk management, and portfolio optimization. I've helped hundreds of traders develop consistent strategies.",
      profileImage: "https://i.pravatar.cc/400?img=12",
      socialLinks: {
        twitter: "https://twitter.com/alexthompson",
        website: "https://alexthompson.trading",
      },
      rating: 4.9,
      reviews: 234,
      offerType: OfferType.BOTH,
      accessPrice: 4900, // $49 in cents
      hourlyRate: 20000, // $200/hr in cents
      skills: ["Cryptocurrency", "Bitcoin", "Technical Analysis", "Risk Management", "Day Trading", "Swing Trading"],
      badges: ["Top performer", "Verified results"],
      videoIntro: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Sample video - replace with actual intro video
      portfolio: [
        {
          title: "$500K Bitcoin Trade - Q4 2024",
          description: "Documented trade where I took BTC from $38K to $55K using technical analysis and risk management strategies I teach in my course.",
          imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800",
          link: "https://example.com/case-study-1",
          type: "result"
        },
        {
          title: "Technical Analysis Masterclass",
          description: "Comprehensive guide to reading charts, identifying patterns, and making data-driven trading decisions.",
          imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
          type: "case-study"
        },
        {
          title: "Risk Management Framework",
          description: "My proprietary risk management system that has kept my portfolio profitable through multiple market cycles.",
          imageUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800",
          link: "https://example.com/risk-framework",
          type: "article"
        }
      ],
      isActive: true,
    },
    {
      id: "mtr-trading-002",
      name: "Sarah Chen",
      email: "sarah.chen@seed.internal",
      category: MentorCategory.trading,
      tagline: "Options strategist • Ex-Goldman Sachs",
      bio: "Former Goldman Sachs trader specializing in options strategies. 12 years of institutional trading experience. I teach advanced options strategies, spreads, and volatility trading.",
      profileImage: "https://i.pravatar.cc/400?img=47",
      socialLinks: {
        linkedin: "https://linkedin.com/in/sarahchen",
      },
      rating: 4.8,
      reviews: 187,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 30000, // $300/hr in cents
      badges: ["Wall Street veteran"],
      skills: ["Options Trading", "Spreads", "Volatility Trading", "Institutional Trading", "Portfolio Management"],
      isActive: true,
    },

    // GAMING
    {
      id: "mtr-gaming-001",
      name: "Tyler 'Ninja' Blevins",
      email: "tyler.ninja@seed.internal",
      category: MentorCategory.gaming,
      tagline: "Valorant Radiant • Former pro player",
      bio: "Professional Valorant player and coach with tournament experience. Peaked Radiant multiple seasons. I focus on game sense, crosshair placement, and mental game. Great for players looking to climb from Diamond to Immortal+.",
      profileImage: "https://i.pravatar.cc/400?img=33",
      socialLinks: {
        twitter: "https://twitter.com/tylerninja",
        twitch: "https://twitch.tv/ninja",
      },
      rating: 4.7,
      reviews: 156,
      offerType: OfferType.BOTH,
      accessPrice: 2900, // $29 in cents
      hourlyRate: 10000, // $100/hr in cents
      skills: ["Valorant", "FPS Games", "Aim Training", "Game Sense", "Crosshair Placement", "Team Strategy"],
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
      bio: "Senior UX designer at Airbnb with a decade of experience. I've shipped products used by millions. Expert in user research, design systems, and accessibility. Get access to my portfolio reviews, design critique sessions, and career growth templates.",
      profileImage: "https://i.pravatar.cc/400?img=45",
      socialLinks: {
        linkedin: "https://linkedin.com/in/emmarodriguez",
        website: "https://emmarodriguez.design",
      },
      rating: 4.9,
      reviews: 203,
      offerType: OfferType.ACCESS,
      accessPrice: 3900, // $39 in cents
      hourlyRate: null,
      skills: ["UI/UX Design", "Figma", "Design Systems", "User Research", "Prototyping", "Accessibility"],
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
      bio: "Certified personal trainer who has helped over 500 clients transform their bodies. NASM-CPT and nutrition specialist. I create custom workout plans, meal prep guides, and accountability coaching. Whether you want to lose fat, build muscle, or improve athletic performance - I've got you covered.",
      profileImage: "https://i.pravatar.cc/400?img=15",
      socialLinks: {
        instagram: "https://instagram.com/marcuswilliamsfit",
        youtube: "https://youtube.com/@marcuswilliams",
      },
      rating: 4.8,
      reviews: 312,
      offerType: OfferType.BOTH,
      accessPrice: 1900, // $19 in cents
      hourlyRate: 8000, // $80/hr in cents
      skills: ["Weight Loss", "Muscle Building", "Nutrition", "Meal Prep", "Strength Training", "Cardio"],
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
      bio: "Native Spanish speaker from Madrid with 8 years of teaching experience. I offer conversational practice, DELE exam prep, and business Spanish. My students consistently reach B2/C1 levels. Sessions are fun, practical, and focused on real-world communication.",
      profileImage: "https://i.pravatar.cc/400?img=48",
      socialLinks: {
        linkedin: "https://linkedin.com/in/anagarcia",
      },
      rating: 4.8,
      reviews: 156,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 3000, // $30/hr in cents
      skills: ["Spanish", "Conversation", "Grammar", "DELE Exam", "Business Spanish", "Pronunciation"],
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
      bio: "Former FAANG recruiter who has conducted over 500 successful hires at Google and Meta. I know exactly what top companies look for. I offer resume teardowns, mock interviews, salary negotiation coaching, and career transition guidance. My students have landed offers at FAANG, startups, and Fortune 500 companies.",
      profileImage: "https://i.pravatar.cc/400?img=68",
      socialLinks: {
        linkedin: "https://linkedin.com/in/davidkumar",
        website: "https://davidkumar.coach",
      },
      rating: 4.9,
      reviews: 243,
      offerType: OfferType.BOTH,
      accessPrice: 2500, // $25 in cents
      skills: ["Resume Review", "Interview Prep", "Salary Negotiation", "Career Transition", "FAANG Interview", "LinkedIn Optimization"],
      hourlyRate: 15000, // $150/hr in cents
      badges: ["Resume teardown", "Mock interviews"],
      isActive: true,
    },
  ];

  // Create sample review users
  const reviewerUsers = [
    { name: "John Smith", email: "john.smith@example.com", image: "https://i.pravatar.cc/150?img=1" },
    { name: "Emily Davis", email: "emily.davis@example.com", image: "https://i.pravatar.cc/150?img=5" },
    { name: "Michael Brown", email: "michael.brown@example.com", image: "https://i.pravatar.cc/150?img=13" },
    { name: "Jessica Wilson", email: "jessica.wilson@example.com", image: "https://i.pravatar.cc/150?img=20" },
    { name: "Chris Taylor", email: "chris.taylor@example.com", image: "https://i.pravatar.cc/150?img=27" },
  ];

  const createdReviewers = [];
  for (const reviewerData of reviewerUsers) {
    const reviewer = await db.user.upsert({
      where: { email: reviewerData.email },
      update: {},
      create: {
        name: reviewerData.name,
        email: reviewerData.email,
        image: reviewerData.image,
      },
    });
    createdReviewers.push(reviewer);
  }

  console.log(`✅ Created ${createdReviewers.length} review users`);

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
    const mentor = await db.mentor.upsert({
      where: { id: mentorData.id },
      update: {
        name: mentorData.name,
        category: mentorData.category,
        tagline: mentorData.tagline,
        bio: mentorData.bio,
        profileImage: mentorData.profileImage,
        socialLinks: mentorData.socialLinks,
        rating: mentorData.rating,
        reviews: mentorData.reviews,
        offerType: mentorData.offerType,
        accessPrice: mentorData.accessPrice,
        hourlyRate: mentorData.hourlyRate,
        badges: mentorData.badges,
        skills: mentorData.skills,
        videoIntro: mentorData.videoIntro,
        portfolio: mentorData.portfolio,
        isActive: mentorData.isActive,
      },
      create: {
        id: mentorData.id,
        userId: user.id,
        name: mentorData.name,
        category: mentorData.category,
        tagline: mentorData.tagline,
        bio: mentorData.bio,
        profileImage: mentorData.profileImage,
        socialLinks: mentorData.socialLinks,
        rating: mentorData.rating,
        reviews: mentorData.reviews,
        offerType: mentorData.offerType,
        accessPrice: mentorData.accessPrice,
        hourlyRate: mentorData.hourlyRate,
        badges: mentorData.badges,
        skills: mentorData.skills,
        videoIntro: mentorData.videoIntro,
        portfolio: mentorData.portfolio,
        isActive: mentorData.isActive,
      },
    });

    console.log(`✅ Seeded mentor: ${mentorData.name}`);

    // Create sample bookings and reviews for each mentor
    const reviewsToCreate = Math.min(3, createdReviewers.length); // Create 3 reviews per mentor
    for (let i = 0; i < reviewsToCreate; i++) {
      const reviewer = createdReviewers[i];

      // Create a completed booking
      const booking = await db.booking.create({
        data: {
          userId: reviewer.id,
          mentorId: mentor.id,
          type: i % 2 === 0 ? "SESSION" : "ACCESS",
          status: "COMPLETED",
          totalPrice: mentor.accessPrice || mentor.hourlyRate || 5000,
          scheduledAt: i % 2 === 0 ? new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000) : null,
          durationMinutes: i % 2 === 0 ? 60 : null,
          stripePaidAt: new Date(Date.now() - (i + 2) * 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Sample review comments
      const comments = [
        "Absolutely amazing experience! Really helped me level up my skills. Highly recommend!",
        "Great mentor with lots of practical advice. Worth every penny.",
        "Very knowledgeable and patient. Learned so much in just one session!",
        "Excellent communication and clear explanations. Will book again!",
        "Fantastic mentor! Changed my entire approach to the subject.",
      ];

      // Create a review for the booking
      await db.review.create({
        data: {
          bookingId: booking.id,
          userId: reviewer.id,
          mentorId: mentor.id,
          rating: 4 + Math.floor(Math.random() * 2), // Random rating 4-5
          comment: comments[i % comments.length],
          isVerifiedPurchase: true,
          createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    console.log(`✅ Created ${reviewsToCreate} reviews for ${mentorData.name}`);
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