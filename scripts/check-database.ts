// scripts/check-database.ts
import { db } from "@/lib/db";

async function main() {
  console.log("\n📊 Database Status Check\n");

  const [userCount, mentorCount, bookingCount] = await Promise.all([
    db.user.count(),
    db.mentor.count(),
    db.booking.count(),
  ]);

  console.log(`Users: ${userCount}`);
  console.log(`Mentors: ${mentorCount}`);
  console.log(`Bookings: ${bookingCount}\n`);

  // Show recent users
  const users = await db.user.findMany({
    take: 5,
    orderBy: { id: "desc" },
    select: { id: true, email: true, name: true },
  });

  console.log("Recent Users:");
  users.forEach((u) => {
    console.log(`  - ${u.email} (${u.name || "no name"})`);
  });

  // Show mentors
  const mentors = await db.mentor.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      isTrusted: true,
      verifiedBookingsCount: true,
      isActive: true,
    },
  });

  console.log("\nMentors:");
  mentors.forEach((m) => {
    console.log(
      `  - ${m.name} | Trusted: ${m.isTrusted} | Verified: ${m.verifiedBookingsCount} | Active: ${m.isActive}`
    );
  });

  // Show test booking
  const testBooking = await db.booking.findFirst({
    where: { notes: { contains: "Test session" } },
    include: {
      user: { select: { email: true } },
      mentor: { select: { name: true } },
    },
  });

  if (testBooking) {
    console.log("\n🧪 Test Booking Found:");
    console.log(`  ID: ${testBooking.id}`);
    console.log(`  User: ${testBooking.user.email}`);
    console.log(`  Mentor: ${testBooking.mentor.name}`);
    console.log(`  Status: ${testBooking.status}`);
    console.log(`  Verified: ${testBooking.isVerified}`);
    console.log(`  Fraud Reported: ${testBooking.isFraudReported}`);
    console.log(`\n  🔗 Test URL: http://localhost:3000/bookings/${testBooking.id}/confirm`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
