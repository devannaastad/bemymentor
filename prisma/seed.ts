// prisma/seed.ts
import { PrismaClient, MentorCategory, OfferType } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const mentors = [
    // GAMING & ESPORTS
    {
      id: "mtr-gaming-001",
      name: "Tyler 'Ace' Martinez",
      email: "tyler.ace@seed.internal",
      category: MentorCategory.GAMING_ESPORTS,
      tagline: "Valorant Radiant • Former pro player",
      bio: "Professional Valorant player and coach with tournament experience. Peaked Radiant multiple seasons. I focus on game sense, crosshair placement, and mental game. Great for players looking to climb from Diamond to Immortal+.",
      profileImage: "https://i.pravatar.cc/400?img=33",
      socialLinks: {
        twitter: "https://twitter.com/acevalorany",
        twitch: "https://twitch.tv/acevalorant",
      },
      rating: 4.8,
      reviews: 156,
      offerType: OfferType.BOTH,
      accessPrice: 2900, // $29
      hourlyRate: 10000, // $100/hr
      skills: ["Valorant", "FPS Games", "Aim Training", "Game Sense", "Crosshair Placement", "Team Strategy"],
      badges: ["Radiant rank", "Tournament winner"],
      isActive: true,
    },
    {
      id: "mtr-gaming-002",
      name: "Jordan 'Freestyler' Chen",
      email: "jordan.freestyler@seed.internal",
      category: MentorCategory.GAMING_ESPORTS,
      tagline: "Rocket League SSL • Freestyle specialist",
      bio: "Supersonic Legend Rocket League player specializing in advanced mechanics and freestyle. I teach air dribbles, ceiling shots, flip resets, and team positioning. Perfect for players stuck in Champion-Grand Champion wanting to master mechanics.",
      profileImage: "https://i.pravatar.cc/400?img=15",
      socialLinks: {
        youtube: "https://youtube.com/@freestylerrl",
        twitter: "https://twitter.com/freestylerrl",
      },
      rating: 4.7,
      reviews: 89,
      offerType: OfferType.TIME,
      accessPrice: null,
      hourlyRate: 7500, // $75/hr
      skills: ["Rocket League", "Freestyle", "Ceiling Shots", "Air Dribbles", "Flip Resets", "Team Coordination"],
      badges: ["SSL rank", "Freestyle expert"],
      isActive: true,
    },

    // TRADING & INVESTING
    {
      id: "mtr-trading-001",
      name: "Alex Thompson",
      email: "alex.thompson@seed.internal",
      category: MentorCategory.TRADING_INVESTING,
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
      accessPrice: 4900, // $49
      hourlyRate: 20000, // $200/hr
      skills: ["Cryptocurrency", "Bitcoin", "Technical Analysis", "Risk Management", "Day Trading", "Swing Trading"],
      badges: ["Top performer", "Verified results"],
      videoIntro: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
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
        }
      ],
      isActive: true,
    },
    {
      id: "mtr-trading-002",
      name: "Sarah Chen",
      email: "sarah.chen@seed.internal",
      category: MentorCategory.TRADING_INVESTING,
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
      hourlyRate: 30000, // $300/hr
      badges: ["Wall Street veteran"],
      skills: ["Options Trading", "Spreads", "Volatility Trading", "Institutional Trading", "Portfolio Management"],
      isActive: true,
    },

    // STREAMING & CONTENT CREATION
    {
      id: "mtr-streaming-001",
      name: "Mia 'StreamQueen' Rodriguez",
      email: "mia.streamqueen@seed.internal",
      category: MentorCategory.STREAMING_CONTENT,
      tagline: "Twitch Partner • 500K+ followers",
      bio: "Twitch Partner with over 500K followers. I grew from 0 to Partner in 18 months. I teach stream setup, audience retention, monetization strategies, and community building. Perfect for aspiring streamers who want to turn their passion into income.",
      profileImage: "https://i.pravatar.cc/400?img=45",
      socialLinks: {
        twitch: "https://twitch.tv/streamqueen",
        twitter: "https://twitter.com/streamqueen",
      },
      rating: 4.9,
      reviews: 203,
      offerType: OfferType.ACCESS,
      accessPrice: 3900, // $39
      hourlyRate: null,
      skills: ["Twitch Streaming", "OBS Setup", "Audience Retention", "Monetization", "Community Building", "Stream Graphics"],
      badges: ["Twitch Partner", "500K followers"],
      isActive: true,
    },
    {
      id: "mtr-streaming-002",
      name: "Marcus 'LiveGuru' Williams",
      email: "marcus.liveguru@seed.internal",
      category: MentorCategory.STREAMING_CONTENT,
      tagline: "YouTube Live expert • 2M+ subscribers",
      bio: "YouTube creator with 2M+ subscribers specializing in live streaming. I teach YouTube Live setup, Super Chat optimization, and building a loyal community. My students have gone from 0 to monetized channels within months.",
      profileImage: "https://i.pravatar.cc/400?img=68",
      socialLinks: {
        youtube: "https://youtube.com/@liveguru",
        instagram: "https://instagram.com/liveguru",
      },
      rating: 4.8,
      reviews: 145,
      offerType: OfferType.BOTH,
      accessPrice: 2900, // $29
      hourlyRate: 15000, // $150/hr
      skills: ["YouTube Live", "Super Chat", "Stream Optimization", "Community Management", "Content Strategy"],
      badges: ["YouTube Partner", "2M+ subs"],
      isActive: true,
    },

    // YOUTUBE PRODUCTION & EDITING
    {
      id: "mtr-youtube-001",
      name: "Emma 'EditPro' Davis",
      email: "emma.editpro@seed.internal",
      category: MentorCategory.YOUTUBE_PRODUCTION,
      tagline: "Premiere Pro master • 10M+ views edited",
      bio: "Professional video editor who has edited content with over 10M total views. I specialize in Premiere Pro, pacing, storytelling, and YouTube-specific editing. I'll teach you how to create engaging content that keeps viewers watching.",
      profileImage: "https://i.pravatar.cc/400?img=48",
      socialLinks: {
        youtube: "https://youtube.com/@editpro",
        website: "https://emmaedits.com",
      },
      rating: 4.9,
      reviews: 167,
      offerType: OfferType.BOTH,
      accessPrice: 3500, // $35
      hourlyRate: 12000, // $120/hr
      skills: ["Premiere Pro", "Video Editing", "Pacing", "Storytelling", "Color Grading", "Audio Mixing"],
      badges: ["10M+ views", "Premiere certified"],
      isActive: true,
    },
    {
      id: "mtr-youtube-002",
      name: "David 'ThumbKing' Kumar",
      email: "david.thumbking@seed.internal",
      category: MentorCategory.YOUTUBE_PRODUCTION,
      tagline: "Thumbnail designer • 20% avg CTR",
      bio: "Thumbnail designer specializing in high CTR designs. My thumbnails average 20% CTR across channels I work with. I teach Photoshop, design psychology, and A/B testing strategies. Great for creators struggling with low click-through rates.",
      profileImage: "https://i.pravatar.cc/400?img=13",
      socialLinks: {
        twitter: "https://twitter.com/thumbking",
        website: "https://thumbking.design",
      },
      rating: 4.8,
      reviews: 134,
      offerType: OfferType.ACCESS,
      accessPrice: 2500, // $25
      hourlyRate: null,
      skills: ["Photoshop", "Thumbnail Design", "Design Psychology", "A/B Testing", "Branding", "Color Theory"],
      badges: ["20% CTR avg", "Design expert"],
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
    const reviewsToCreate = Math.min(3, createdReviewers.length);
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
        "Best investment I've made in my growth. Thank you!",
        "10/10 would book again. Super helpful and professional.",
      ];

      // Create review
      await db.review.create({
        data: {
          userId: reviewer.id,
          mentorId: mentor.id,
          bookingId: booking.id,
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
          comment: comments[i % comments.length],
        },
      });
    }
  }

  console.log("\n🎉 Database seeding complete!");
  console.log(`✅ Created ${mentors.length} mentors with sample reviews`);
  console.log("\n🎮 Categories:");
  console.log("  - Gaming & Esports");
  console.log("  - Trading & Investing");
  console.log("  - Streaming & Content Creation");
  console.log("  - YouTube Production & Editing");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
