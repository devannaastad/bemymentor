// app/api/avatar/save-url/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = (await req.json()) as { url?: string };
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { image: url },
  });

  return NextResponse.json({ ok: true });
}
