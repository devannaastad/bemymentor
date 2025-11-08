import { db } from "@/lib/db";

async function main() {
  const mentors = await db.mentor.findMany({
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  
  console.log('Total mentors:', mentors.length);
  mentors.forEach(m => {
    console.log(`- ${m.name} (${m.user.email}) - Active: ${m.isActive}, Flagged: ${m.flagged}`);
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
