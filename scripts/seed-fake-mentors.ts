import { PrismaClient, MentorCategory, OfferType } from "@prisma/client";

const prisma = new PrismaClient();

const fakeMentorsData = [
  {
    user: {
      name: "Alex 'Pro' Martinez",
      email: "alex.martinez@fake.com",
    },
    mentor: {
      name: "Alex 'Pro' Martinez",
      tagline: "Radiant Valorant player - 5000+ hours coaching experience",
      bio: "Former professional Valorant player with tournament experience. I've helped over 200 students reach their rank goals. Specializing in aim training, game sense, and mental coaching.",
      category: MentorCategory.GAMING_ESPORTS,
      skills: ["Valorant", "Aim Training", "Game Sense", "Coaching"],
      hourlyRate: 75,
      accessPrice: 199,
      offerType: OfferType.BOTH,
      rating: 4.9,
      reviews: 156,
      isTrusted: true,
      isActive: true,
    },
  },
  {
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@fake.com",
    },
    mentor: {
      name: "Sarah Johnson",
      tagline: "Options trading expert - $2M+ in personal gains",
      bio: "Full-time options trader with 8 years of experience. I teach conservative strategies that focus on consistent returns. My students average 15-20% monthly returns.",
      category: MentorCategory.TRADING_INVESTING,
      skills: ["Options Trading", "Technical Analysis", "Risk Management", "Stocks"],
      hourlyRate: 150,
      accessPrice: 499,
      offerType: OfferType.BOTH,
      rating: 4.8,
      reviews: 89,
      isTrusted: true,
      isActive: true,
    },
  },
  {
    user: {
      name: "Mike 'StreamKing' Chen",
      email: "mike.chen@fake.com",
    },
    mentor: {
      name: "Mike 'StreamKing' Chen",
      tagline: "Grew from 0 to 50K Twitch followers in 6 months",
      bio: "Twitch Partner and full-time streamer. I'll teach you everything about streaming setup, engagement strategies, and monetization. Specializing in gaming content.",
      category: MentorCategory.STREAMING_CONTENT,
      skills: ["Twitch", "Streaming", "Audience Growth", "OBS Setup", "Gaming"],
      hourlyRate: 60,
      accessPrice: 149,
      offerType: OfferType.BOTH,
      rating: 4.7,
      reviews: 234,
      isTrusted: true,
      isActive: true,
    },
  },
  {
    user: {
      name: "Emma Thompson",
      email: "emma.t@fake.com",
    },
    mentor: {
      name: "Emma Thompson",
      tagline: "YouTube monetization specialist - 500K+ subscribers",
      bio: "Certified YouTube Partner with multiple channels. I specialize in thumbnail design, SEO optimization, and rapid channel growth strategies.",
      category: MentorCategory.YOUTUBE_PRODUCTION,
      skills: ["YouTube", "Thumbnails", "SEO", "Video Editing", "Growth Strategy"],
      hourlyRate: 80,
      accessPrice: 249,
      offerType: OfferType.BOTH,
      rating: 4.9,
      reviews: 178,
      isTrusted: true,
      isActive: true,
    },
  },
  {
    user: {
      name: "Tyler 'RocketGod' Wright",
      email: "tyler.w@fake.com",
    },
    mentor: {
      name: "Tyler 'RocketGod' Wright",
      tagline: "Grand Champion Rocket League coach - SSL ranked",
      bio: "Professional Rocket League coach with SSL rank across all playlists. Specialized training for mechanics, rotation, and game IQ. Perfect for Platinum to GC players.",
      category: MentorCategory.GAMING_ESPORTS,
      skills: ["Rocket League", "Mechanics Training", "Rotation", "1v1", "2v2", "3v3"],
      hourlyRate: 50,
      accessPrice: 129,
      offerType: OfferType.BOTH,
      rating: 4.6,
      reviews: 145,
      isTrusted: false,
      isActive: true,
    },
  },
  {
    user: {
      name: "David Park",
      email: "david.p@fake.com",
    },
    mentor: {
      name: "David Park",
      tagline: "Day trading mentor - Consistent 6-figure yearly profits",
      bio: "Professional day trader focused on scalping and momentum trading. I teach proven strategies with strict risk management. Beginners welcome!",
      category: MentorCategory.TRADING_INVESTING,
      skills: ["Day Trading", "Scalping", "Momentum Trading", "Stocks", "Crypto"],
      hourlyRate: 120,
      accessPrice: 399,
      offerType: OfferType.BOTH,
      rating: 4.5,
      reviews: 67,
      isTrusted: true,
      isActive: true,
    },
  },
  {
    user: {
      name: "Jessica 'JessPlays' Rodriguez",
      email: "jess.r@fake.com",
    },
    mentor: {
      name: "Jessica 'JessPlays' Rodriguez",
      tagline: "League of Legends Challenger - Support and ADC main",
      bio: "Reached Challenger playing Support and ADC. I focus on macro gameplay, wave management, and teamfight positioning. Over 1000 coaching sessions completed.",
      category: MentorCategory.GAMING_ESPORTS,
      skills: ["League of Legends", "Support", "ADC", "Macro", "Wave Management"],
      hourlyRate: 65,
      accessPrice: 179,
      offerType: OfferType.BOTH,
      rating: 4.8,
      reviews: 312,
      isTrusted: true,
      isActive: true,
    },
  },
  {
    user: {
      name: "Chris Anderson",
      email: "chris.a@fake.com",
    },
    mentor: {
      name: "Chris Anderson",
      tagline: "Content creator consultant - Built 3 channels to 100K+",
      bio: "I've grown multiple YouTube channels and helped dozens of creators monetize. Expertise in content strategy, editing workflows, and brand deals.",
      category: MentorCategory.YOUTUBE_PRODUCTION,
      skills: ["Content Strategy", "Video Editing", "Premiere Pro", "Brand Deals"],
      hourlyRate: 70,
      accessPrice: 199,
      offerType: OfferType.BOTH,
      rating: 4.4,
      reviews: 92,
      isTrusted: false,
      isActive: true,
    },
  },
  {
    user: {
      name: "Rachel Kim",
      email: "rachel.k@fake.com",
    },
    mentor: {
      name: "Rachel Kim",
      tagline: "Forex trading expert - 10 years experience",
      bio: "Specialized in forex pairs and technical analysis. I teach swing trading strategies with focus on EUR/USD and GBP/USD. Conservative approach with consistent results.",
      category: MentorCategory.TRADING_INVESTING,
      skills: ["Forex", "Technical Analysis", "Swing Trading", "Chart Patterns"],
      hourlyRate: 100,
      accessPrice: 299,
      offerType: OfferType.BOTH,
      rating: 4.7,
      reviews: 134,
      isTrusted: true,
      isActive: true,
    },
  },
  {
    user: {
      name: "Marcus 'Clutch' Williams",
      email: "marcus.w@fake.com",
    },
    mentor: {
      name: "Marcus 'Clutch' Williams",
      tagline: "CS2 Global Elite coach - Former semi-pro",
      bio: "Former semi-professional CS2 player now coaching full-time. Specializing in aim improvement, utility usage, and competitive tactics. All ranks welcome.",
      category: MentorCategory.GAMING_ESPORTS,
      skills: ["CS2", "Counter-Strike", "Aim Training", "Utility", "Tactics"],
      hourlyRate: 55,
      accessPrice: 139,
      offerType: OfferType.BOTH,
      rating: 4.6,
      reviews: 201,
      isTrusted: false,
      isActive: true,
    },
  },
  {
    user: {
      name: "Nina Patel",
      email: "nina.p@fake.com",
    },
    mentor: {
      name: "Nina Patel",
      tagline: "Live streaming coach for beginners",
      bio: "I help new streamers set up their first streams and build their communities. Affordable coaching focused on basics: overlays, chatbot setup, and engagement.",
      category: MentorCategory.STREAMING_CONTENT,
      skills: ["Streaming Basics", "Overlays", "Streamlabs", "Community Building"],
      hourlyRate: 35,
      accessPrice: 89,
      offerType: OfferType.BOTH,
      rating: 4.3,
      reviews: 78,
      isTrusted: false,
      isActive: true,
    },
  },
  {
    user: {
      name: "Brandon Lee",
      email: "brandon.l@fake.com",
    },
    mentor: {
      name: "Brandon Lee",
      tagline: "YouTube Shorts specialist - 10M+ total views",
      bio: "Mastered the YouTube Shorts algorithm. I teach content creation, hooks, and editing specifically for short-form content. Perfect for growing new channels fast.",
      category: MentorCategory.YOUTUBE_PRODUCTION,
      skills: ["YouTube Shorts", "Short-form Content", "CapCut", "Viral Content"],
      hourlyRate: 45,
      accessPrice: 119,
      offerType: OfferType.BOTH,
      rating: 4.5,
      reviews: 156,
      isTrusted: false,
      isActive: true,
    },
  },
  {
    user: {
      name: "Sophia Turner",
      email: "sophia.t@fake.com",
    },
    mentor: {
      name: "Sophia Turner",
      tagline: "Crypto trading and NFT investment advisor",
      bio: "Specialized in cryptocurrency trading and NFT investments. I teach fundamental and technical analysis for crypto markets. Risk management is my priority.",
      category: MentorCategory.TRADING_INVESTING,
      skills: ["Crypto", "Bitcoin", "Ethereum", "NFTs", "DeFi"],
      hourlyRate: 90,
      accessPrice: 249,
      offerType: OfferType.BOTH,
      rating: 4.2,
      reviews: 45,
      isTrusted: false,
      isActive: true,
    },
  },
  {
    user: {
      name: "Jake 'Apex Pred' Morrison",
      email: "jake.m@fake.com",
    },
    mentor: {
      name: "Jake 'Apex Pred' Morrison",
      tagline: "Apex Legends Predator rank - Movement specialist",
      bio: "Multi-season Predator player. I focus on advanced movement mechanics, legend selection, and positioning. Great for Diamond+ players looking to improve.",
      category: MentorCategory.GAMING_ESPORTS,
      skills: ["Apex Legends", "Movement", "Positioning", "Legend Guides"],
      hourlyRate: 60,
      accessPrice: 159,
      offerType: OfferType.BOTH,
      rating: 4.7,
      reviews: 189,
      isTrusted: true,
      isActive: true,
    },
  },
  {
    user: {
      name: "Olivia Martinez",
      email: "olivia.m@fake.com",
    },
    mentor: {
      name: "Olivia Martinez",
      tagline: "TikTok to YouTube conversion expert",
      bio: "Helped creators transition from TikTok to YouTube successfully. I teach content adaptation, audience retention, and cross-platform growth strategies.",
      category: MentorCategory.YOUTUBE_PRODUCTION,
      skills: ["TikTok", "YouTube", "Content Adaptation", "Cross-platform Growth"],
      hourlyRate: 55,
      accessPrice: 149,
      offerType: OfferType.BOTH,
      rating: 4.6,
      reviews: 103,
      isTrusted: false,
      isActive: true,
    },
  },
];

async function main() {
  console.log("Starting to seed fake mentors...");

  for (const data of fakeMentorsData) {
    try {
      // Create user first, then mentor
      const user = await prisma.user.create({
        data: data.user,
      });

      const mentor = await prisma.mentor.create({
        data: {
          ...data.mentor,
          userId: user.id,
        },
      });

      console.log(`✅ Created mentor: ${mentor.name}`);
    } catch (error: any) {
      console.error(`❌ Failed to create mentor ${data.user.name}:`, error.message);
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log(`📊 Created ${fakeMentorsData.length} fake mentors`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
