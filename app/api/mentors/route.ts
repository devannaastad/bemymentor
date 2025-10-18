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

  const priceMin = priceMinRaw ? Number(priceMinRaw) : undefined;
  const priceMax = priceMaxRaw ? Number(priceMaxRaw) : undefined;

  const where: Prisma.MentorWhereInput = {};

  // Specific IDs filter (for saved mentors)
  if (idsRaw) {
    const ids = idsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length) where.id = { in: ids };
  }

  // Text search (case-insensitive)
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { tagline: { contains: q, mode: "insensitive" } },
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

  try {
    const mentors = await prisma.mentor.findMany({
      where,
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
      take: 48,
    });

    return NextResponse.json({ ok: true, data: mentors });
  } catch (error) {
    console.error("[api/mentors] Query failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch mentors" }, 
      { status: 500 }
    );
  }
}