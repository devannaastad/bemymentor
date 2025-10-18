// app/api/saved/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Mentor } from "@prisma/client";

/**
 * GET  /api/saved
 *  - returns the current user's saved mentors (full mentor objects)
 *  - 401 if not signed in
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ ok: true, data: [] as Mentor[] });
  }

  const rows = await db.savedMentor.findMany({
    where: { userId: user.id },
    include: { mentor: true },
    orderBy: { createdAt: "desc" },
  });

  const mentors: Mentor[] = rows.map((r) => r.mentor);
  return NextResponse.json({ ok: true, data: mentors });
}

/**
 * POST /api/saved
 * body: { mentorId: string }
 *  - idempotently saves a mentor for the current user
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { mentorId?: string };
  if (!body.mentorId) {
    return NextResponse.json({ ok: false, error: "missing mentorId" }, { status: 400 });
  }

  const user = await db.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
    select: { id: true },
  });

  await db.savedMentor.upsert({
    where: { userId_mentorId: { userId: user.id, mentorId: body.mentorId } },
    update: {},
    create: { userId: user.id, mentorId: body.mentorId },
  });

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/saved?mentorId=...
 *  - removes a saved mentor for the current user
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mentorId = url.searchParams.get("mentorId") ?? undefined;
  if (!mentorId) {
    return NextResponse.json({ ok: false, error: "missing mentorId" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ ok: true });

  await db.savedMentor.deleteMany({
    where: { userId: user.id, mentorId },
  });

  return NextResponse.json({ ok: true });
}
