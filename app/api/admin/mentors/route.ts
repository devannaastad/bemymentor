import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const session = await auth();
    console.log("[API /api/admin/mentors] Session:", session?.user?.email);

    if (!session || !isAdmin(session.user?.email)) {
      console.log("[API /api/admin/mentors] Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[API /api/admin/mentors] Fetching mentors...");
    const mentors = await db.mentor.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
        bookings: {
          select: {
            id: true,
            totalPrice: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mentorsWithStats = mentors.map((mentor) => {
      const completedBookings = mentor.bookings.filter((b) => b.status === "COMPLETED");
      const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

      return {
        id: mentor.id,
        name: mentor.name,
        email: mentor.user.email,
        category: mentor.category,
        profileImage: mentor.profileImage,
        rating: mentor.rating,
        reviews: mentor.reviews,
        isActive: mentor.isActive,
        flagged: mentor.flagged,
        flagReason: mentor.flagReason,
        createdAt: mentor.createdAt.toISOString(),
        bookingsCount: mentor.bookings.length,
        totalEarnings,
      };
    });

    console.log("[API /api/admin/mentors] Returning", mentorsWithStats.length, "mentors");
    return NextResponse.json({ mentors: mentorsWithStats });
  } catch (error) {
    console.error("[API /api/admin/mentors] Error:", error);
    return NextResponse.json({ error: "Failed to fetch mentors" }, { status: 500 });
  }
}
