// app/api/admin/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/applications/:id
 * Update application status (approve/reject) and optionally create mentor profile
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const body = await req.json();

    const parsed = {
      status: body.status as "PENDING" | "APPROVED" | "REJECTED" | undefined,
      notes: body.notes as string | undefined,
      reviewedBy: body.reviewedBy as string | undefined,
    };

    const application = await db.application.update({
      where: { id },
      data: {
        ...(parsed.status && { status: parsed.status }),
        ...(parsed.notes !== undefined && { notes: parsed.notes }),
        ...(parsed.reviewedBy && { reviewedBy: parsed.reviewedBy }),
        reviewedAt: parsed.status ? new Date() : undefined,
      },
    });

    // Note: We no longer auto-create mentor profiles here
    // Users must complete the /mentor-setup flow after approval

    return NextResponse.json({ ok: true, data: application });
  } catch (error) {
    console.error("[admin:update] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}