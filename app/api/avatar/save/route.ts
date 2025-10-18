// app/api/avatar/save/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = (await req.json()) as { url?: string };
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  await db.user.update({
    where: { email },
    data: { image: url },
  });

  return NextResponse.json({ ok: true });
}
