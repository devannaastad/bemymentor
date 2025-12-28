// app/api/admin/disputes/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/**
 * GET /api/admin/disputes
 * Get all disputes (bookings with fraud reports)
 */
export async function GET() {
  try {
    await requireAdmin();

    const disputes = await db.booking.findMany({
      where: {
        isFraudReported: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            userId: true,
            verifiedBookingsCount: true,
            isTrusted: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: 50,
        },
      },
      orderBy: {
        fraudReportedAt: "desc",
      },
    });

    return NextResponse.json({ ok: true, data: disputes });
  } catch (error) {
    console.error("[admin:disputes] GET failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}
