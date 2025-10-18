// app/api/applications/route.ts
import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/schemas/application";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { sendApplicationConfirmation, sendAdminNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("[application:received]", data);

    const parsed = applicationSchema.parse(data);
    console.log("[application:parsed]", parsed);

    // Check for duplicate email (prevent spam)
    const existingApp = await db.application.findFirst({
      where: {
        email: parsed.email,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (existingApp) {
      console.log("[application:duplicate]", parsed.email);
      return NextResponse.json(
        { 
          ok: false, 
          message: "You've already submitted an application recently. Please wait 24 hours before reapplying." 
        },
        { status: 429 }
      );
    }

    // Create application in database
    const application = await db.application.create({
      data: {
        fullName: parsed.fullName,
        email: parsed.email,
        topic: parsed.topic,
        proofLinks: parsed.proofLinks,
        offerType: parsed.offerType,
        accessPrice: parsed.price ?? null,
        hourlyRate: parsed.hourlyRate ?? null,
      },
    });

    console.log("[application:created]", {
      id: application.id,
      email: application.email,
      topic: application.topic,
    });

    // Send emails (don't await - let them run in background)
    Promise.all([
      // Confirmation to applicant
      sendApplicationConfirmation({
        to: application.email,
        applicantName: application.fullName,
        topic: application.topic,
      }),
      
      // Notification to admin
      sendAdminNotification({
        applicantName: application.fullName,
        applicantEmail: application.email,
        topic: application.topic,
        offerType: application.offerType,
        accessPrice: application.accessPrice ?? undefined,
        hourlyRate: application.hourlyRate ?? undefined,
        proofLinks: application.proofLinks,
        applicationId: application.id,
      }),
    ]).catch((err) => {
      console.error("[application:emails] Failed to send:", err);
      // Don't fail the request if emails fail
    });

    return NextResponse.json({ 
      ok: true,
      message: "Application submitted successfully! Check your email for confirmation.",
    });
  } catch (err: unknown) {
    console.error("[application:error]", err);
    
    if (err instanceof ZodError) {
      console.error("[application:validation-error]", err.issues);
      return NextResponse.json(
        { 
          ok: false, 
          message: "Validation failed: " + err.issues.map(i => i.message).join(", "),
          errors: err.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { ok: false, message: "Failed to submit application. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for admin to list applications
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Number(searchParams.get("limit")) || 50;

  try {
    const applications = await db.application.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ ok: true, data: applications });
  } catch (err) {
    console.error("[application:list] Error:", err);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}