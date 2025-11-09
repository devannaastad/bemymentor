import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Get mentors matching the query in name, tagline, or bio
    const mentors = await db.mentor.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { tagline: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
          { skills: { hasSome: [query] } },
        ],
      },
      select: {
        name: true,
        tagline: true,
        skills: true,
      },
      take: 10,
    });

    // Extract unique suggestions
    const suggestions = new Set<string>();

    // Add mentor names that match
    mentors.forEach((mentor) => {
      if (mentor.name.toLowerCase().includes(query)) {
        suggestions.add(mentor.name);
      }

      // Add matching skills
      mentor.skills.forEach((skill) => {
        if (skill.toLowerCase().includes(query)) {
          suggestions.add(skill);
        }
      });

      // Extract keywords from tagline
      if (mentor.tagline?.toLowerCase().includes(query)) {
        const words = mentor.tagline.split(" ");
        words.forEach((word) => {
          const cleanWord = word.replace(/[^a-z0-9]/gi, "");
          if (
            cleanWord.toLowerCase().includes(query) &&
            cleanWord.length > 3
          ) {
            suggestions.add(cleanWord);
          }
        });
      }
    });

    // Popular search terms (static fallback)
    const popularTerms = [
      "Valorant",
      "League of Legends",
      "Rocket League",
      "Trading",
      "Options",
      "Stocks",
      "YouTube",
      "Twitch",
      "Streaming",
      "Thumbnails",
      "Editing",
      "Growth",
      "Coaching",
    ];

    popularTerms.forEach((term) => {
      if (term.toLowerCase().includes(query)) {
        suggestions.add(term);
      }
    });

    // Convert to array and limit to 8 suggestions
    const suggestionArray = Array.from(suggestions).slice(0, 8);

    return NextResponse.json({ suggestions: suggestionArray });
  } catch (error) {
    console.error("[API /api/search-suggestions] Error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
