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
  const idsRaw = (searchParams.get("ids") ?? "").trim(); // NEW: comma-separated IDs

  const priceMin = priceMinRaw ? Number(priceMinRaw) : undefined;
  const priceMax = priceMaxRaw ? Number(priceMaxRaw) : undefined;

  const where: Prisma.MentorWhereInput = {};

  if (idsRaw) {
    const ids = idsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length) where.id = { in: ids };
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { tagline: { contains: q } },
    ];
  }

  if ((Object.values(MentorCategory) as string[]).includes(category)) {
    where.category = category as MentorCategory;
  }

  if (["ACCESS", "TIME", "BOTH"].includes(offerTypeRaw)) {
    where.offerType = offerTypeRaw as OfferType;
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    const range: Prisma.IntNullableFilter = {};
    if (priceMin !== undefined) range.gte = priceMin;
    if (priceMax !== undefined) range.lte = priceMax;

    const andClauses: Prisma.MentorWhereInput[] = [];
    if (Array.isArray(where.AND)) andClauses.push(...where.AND);
    else if (where.AND) andClauses.push(where.AND);
    andClauses.push({ OR: [{ accessPrice: range }, { hourlyRate: range }] });
    where.AND = andClauses;
  }

  const mentors = await prisma.mentor.findMany({
    where,
    orderBy: [{ rating: "desc" }, { reviews: "desc" }],
    take: 48,
  });

  return NextResponse.json({ ok: true, data: mentors });
}
