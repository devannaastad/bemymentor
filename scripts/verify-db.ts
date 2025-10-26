import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const mentors = await db.mentor.findMany({
    select: { name: true, accessPrice: true, hourlyRate: true, isActive: true }
  });
  
  console.log(`\n📊 ${mentors.length} mentors in database:\n`);
  mentors.forEach(m => {
    const access = m.accessPrice ? `$${m.accessPrice / 100}` : 'N/A';
    const hourly = m.hourlyRate ? `$${m.hourlyRate / 100}/hr` : 'N/A';
    console.log(`✓ ${m.name}: ACCESS=${access}, HOURLY=${hourly}`);
  });
  console.log('');
}

main().finally(() => db.$disconnect());
