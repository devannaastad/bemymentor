// lib/db-queries.ts
import { cache } from "react";
import { db } from "@/lib/db";

// Cached catalog query (adjust select if you want stricter payloads)
export const getCatalog = cache(async () => {
  const mentors = await db.mentor.findMany({
    orderBy: { createdAt: "desc" },
    // If you want a smaller payload later, change to a valid select shape for your schema.
    // select: { id: true, name: true, image: true, price: true, category: true, ... }
  });
  return mentors;
});
