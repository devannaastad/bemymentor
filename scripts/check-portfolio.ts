import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const alexThompson = await db.mentor.findFirst({
    where: {
      user: {
        email: "alex.thompson@seed.internal"
      }
    },
    select: {
      name: true,
      portfolio: true,
      skills: true
    }
  });

  if (!alexThompson) {
    console.log("❌ Alex Thompson not found in database");
    return;
  }

  console.log(`\n✅ Found mentor: ${alexThompson.name}\n`);

  console.log("📚 Skills:", alexThompson.skills);
  console.log("\n🎨 Portfolio:");
  if (alexThompson.portfolio && Array.isArray(alexThompson.portfolio)) {
    type PortfolioItem = { title: string; description?: string; imageUrl?: string; link?: string; type: string };
    (alexThompson.portfolio as unknown as PortfolioItem[]).forEach((item, index: number) => {
      console.log(`\n  ${index + 1}. ${item.title} [${item.type}]`);
      console.log(`     Description: ${item.description?.substring(0, 60)}...`);
      console.log(`     Image: ${item.imageUrl ? '✓' : '✗'}`);
      console.log(`     Link: ${item.link || 'N/A'}`);
    });
  } else {
    console.log("  No portfolio items found");
  }
}

main().finally(() => db.$disconnect());
