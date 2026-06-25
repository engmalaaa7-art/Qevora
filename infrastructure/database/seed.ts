import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding subscription plans...");

  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      name: "Free Trial",
      slug: "free",
      priceMonthly: 0,
      priceYearly: 0,
      maxProjects: 1,
      maxPagesPerSite: 3,
      aiTokensPerMonth: 50000,
      customDomains: false,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro Plan",
      slug: "pro",
      priceMonthly: 29,
      priceYearly: 290,
      maxProjects: 10,
      maxPagesPerSite: 15,
      aiTokensPerMonth: 1000000,
      customDomains: true,
    },
  });

  console.log("Seeding template categories...");

  const businessCat = await prisma.templateCategory.upsert({
    where: { slug: "business" },
    update: {},
    create: {
      name: "Business & Corporate",
      slug: "business",
    },
  });

  const ecommerceCat = await prisma.templateCategory.upsert({
    where: { slug: "ecommerce" },
    update: {},
    create: {
      name: "Online Store & Shop",
      slug: "ecommerce",
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
