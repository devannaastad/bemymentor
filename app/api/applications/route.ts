// app/api/applications/route.ts
import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/schemas/application";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = applicationSchema.parse(data); // coerces
    console.log("[application:create]", parsed);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json({ ok: false, errors: err.issues }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Unexpected error" }, { status: 500 });
  }
}
