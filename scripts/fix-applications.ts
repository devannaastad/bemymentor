import { db } from "../lib/db";

async function fixApplications() {
  console.log("Fixing application records...");
  
  // Update or delete applications with invalid topic values
  const apps = await db.application.findMany();
  
  for (const app of apps) {
    // If topic is a category enum value, it's invalid - delete it or update to a descriptive string
    if (["STREAMING_CONTENT", "GAMING_ESPORTS", "TRADING_INVESTING", "YOUTUBE_PRODUCTION", "trading", "gaming", "design", "fitness", "languages", "career"].includes(app.topic)) {
      console.log(`Deleting invalid application ${app.id} with topic: ${app.topic}`);
      await db.application.delete({ where: { id: app.id } });
    }
  }
  
  console.log("Done!");
}

fixApplications()
  .catch(console.error)
  .finally(() => process.exit(0));
