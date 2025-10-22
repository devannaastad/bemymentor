// scripts/create-test-booking.ts
// Quick script to create a test completed booking for fraud system testing

import { db } from "@/lib/db";

async function main() {
  console.log("🧪 Creating test booking for fraud system testing...\n");

  // Get or create a test user
  const testUser = await db.user.upsert({
    where: { email: "testuser@example.com" },
    update: {},
    create: {
      email: "testuser@example.com",
      name: "Test User",
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Test user: ${testUser.email} (${testUser.id})`);

  // Get a mentor (let's use the first one from seed data)
  const mentor = await db.mentor.findFirst({
    where: { isActive: true },
  });

  if (!mentor) {
    console.error("❌ No mentors found! Run seed script first.");
    process.exit(1);
  }

  console.log(`✅ Using mentor: ${mentor.name} (${mentor.id})`);
  console.log(`   Trusted: ${mentor.isTrusted}, Verified Bookings: ${mentor.verifiedBookingsCount}\n`);

  // Create a completed booking
  const booking = await db.booking.create({
    data: {
      userId: testUser.id,
      mentorId: mentor.id,
      type: "SESSION",
      status: "COMPLETED",
      totalPrice: 20000, // $200
      platformFee: 4000, // $40 (20%)
      mentorPayout: 16000, // $160
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      durationMinutes: 60,
      stripePaidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Paid 3 days ago
      stripePaymentIntentId: `test_pi_${Date.now()}`,
      notes: "Test session for fraud system testing",
      payoutStatus: "HELD", // Funds held pending verification
    },
  });

  console.log(`✅ Created completed booking: ${booking.id}`);
  console.log(`   Type: ${booking.type}`);
  console.log(`   Status: ${booking.status}`);
  console.log(`   Payout Status: ${booking.payoutStatus}`);
  console.log(`   Total: $${(booking.totalPrice / 100).toFixed(2)}`);
  console.log(`   Verified: ${booking.isVerified}`);
  console.log(`   Fraud Reported: ${booking.isFraudReported}\n`);

  console.log("🎉 Test booking created successfully!\n");
  console.log("📋 To test the fraud system:");
  console.log(`   1. Sign in as: ${testUser.email}`);
  console.log(`   2. Visit: http://localhost:3000/bookings/${booking.id}/confirm`);
  console.log(`   3. You should see the verification UI`);
  console.log(`   4. Try both "Verify" and "Report Fraud" buttons\n`);

  console.log("💡 Tips:");
  console.log(`   - Mentor needs ${5 - mentor.verifiedBookingsCount} more verifications to become trusted`);
  console.log(`   - Fraud reports on untrusted mentors = auto-refund`);
  console.log(`   - After 5 verifications, all HELD funds are released\n`);
}

main()
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
