const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log("=== Qevora Database Verification Script ===");
  const prisma = new PrismaClient();

  try {
    // 1. Connect to database
    console.log("Connecting to the database...");
    await prisma.$connect();
    console.log("✓ Connected successfully.");

    // 2. Ensure default SubscriptionPlan exists
    console.log("Ensuring default SubscriptionPlan exists...");
    const plan = await prisma.subscriptionPlan.upsert({
      where: { slug: 'free' },
      update: {},
      create: {
        name: 'Free Trial',
        slug: 'free',
        priceMonthly: 0,
        priceYearly: 0,
        maxProjects: 3,
        maxPagesPerSite: 5,
        aiTokensPerMonth: 10000,
        customDomains: false
      }
    });
    console.log(`✓ Subscription Plan active: ${plan.name} (${plan.id})`);

    // 3. Create dummy User
    console.log("Creating dummy User (test_db@qevora.com)...");
    // Clean up if user already exists from previous runs
    await prisma.user.deleteMany({
      where: { email: 'test_db@qevora.com' }
    });

    const user = await prisma.user.create({
      data: {
        email: 'test_db@qevora.com',
        fullName: 'DB Tester User',
        planId: plan.id
      }
    });
    console.log(`✓ Created user: ${user.fullName} (${user.id})`);

    // 4. Fetch the user and print
    console.log("Fetching user from database...");
    const fetchedUser = await prisma.user.findUnique({
      where: { email: 'test_db@qevora.com' },
      include: {
        subscriptionPlan: true
      }
    });

    console.log("\n--- Fetched User Object from Database ---");
    console.log(JSON.stringify(fetchedUser, null, 2));
    console.log("-----------------------------------------\n");

    console.log("✓ CRUD Verification Successful.");

  } catch (err) {
    console.error("❌ Database Verification Failed with error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
