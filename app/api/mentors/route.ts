// app/api/mentors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MentorCategory, OfferType, Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const category = (searchParams.get("category") ?? "").trim().toLowerCase();
  const priceMinRaw = searchParams.get("priceMin");
  const priceMaxRaw = searchParams.get("priceMax");
  const offerTypeRaw = (searchParams.get("type") ?? "").trim().toUpperCase();
  const idsRaw = (searchParams.get("ids") ?? "").trim();
  const skillsRaw = (searchParams.get("skills") ?? "").trim();
  const sortBy = searchParams.get("sort") ?? "rating";
  const pageRaw = searchParams.get("page");
  const limitRaw = searchParams.get("limit");

  const priceMin = priceMinRaw ? Number(priceMinRaw) : undefined;
  const priceMax = priceMaxRaw ? Number(priceMaxRaw) : undefined;
  const page = pageRaw ? Math.max(1, Number(pageRaw)) : 1;
  const limit = limitRaw ? Math.min(100, Math.max(1, Number(limitRaw))) : 24;
  const skip = (page - 1) * limit;

  const where: Prisma.MentorWhereInput = {};

  // Specific IDs filter (for saved mentors)
  if (idsRaw) {
    const ids = idsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length) where.id = { in: ids };
  }

  // Text search (case-insensitive) - searches name, tagline, and skills
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { tagline: { contains: q, mode: "insensitive" } },
      { skills: { has: q } }, // Exact match for skill
      { skills: { hasSome: [q] } }, // Match if query appears in any skill
    ];
  }

  // Category filter
  if ((Object.values(MentorCategory) as string[]).includes(category)) {
    where.category = category as MentorCategory;
  }

  // Offer type filter
  if (["ACCESS", "TIME", "BOTH"].includes(offerTypeRaw)) {
    where.offerType = offerTypeRaw as OfferType;
  }

  // Skills filter - match mentors that have ANY of the requested skills
  if (skillsRaw) {
    const skills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (skills.length > 0) {
      where.skills = {
        hasSome: skills, // Postgres array operator - matches if ANY skill is in the mentor's skills array
      };
    }
  }

  // Price range filter
  if (priceMin !== undefined || priceMax !== undefined) {
    const range: Prisma.IntNullableFilter = {};
    if (priceMin !== undefined) range.gte = priceMin;
    if (priceMax !== undefined) range.lte = priceMax;

    const andClauses: Prisma.MentorWhereInput[] = [];
    if (Array.isArray(where.AND)) andClauses.push(...where.AND);
    else if (where.AND) andClauses.push(where.AND);
    
    // Match either accessPrice OR hourlyRate
    andClauses.push({ 
      OR: [
        { accessPrice: range }, 
        { hourlyRate: range }
      ] 
    });
    where.AND = andClauses;
  }

  // Determine sort order
  let orderBy: Prisma.MentorOrderByWithRelationInput[] = [];
  switch (sortBy) {
    case "rating":
      orderBy = [{ rating: "desc" }, { reviews: "desc" }];
      break;
    case "newest":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "reviews":
      orderBy = [{ reviews: "desc" }, { rating: "desc" }];
      break;
    case "price-low":
      orderBy = [{ accessPrice: "asc" }, { hourlyRate: "asc" }];
      break;
    case "price-high":
      orderBy = [{ accessPrice: "desc" }, { hourlyRate: "desc" }];
      break;
    default:
      orderBy = [{ rating: "desc" }, { reviews: "desc" }];
  }

  try {
    const [mentors, total] = await Promise.all([
      prisma.mentor.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.mentor.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      ok: true,
      data: mentors,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      }
    });
  } catch (error) {
    console.error("[api/mentors] Query failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}