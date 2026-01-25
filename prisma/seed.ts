import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import "dotenv/config";
import {
  PrismaClient,
  type Prisma,
  ProductStatus,
  UserStatus,
} from "src/generated/prisma/client";

if (process.env.NODE_ENV !== "development") {
  console.error("⛔ This script can only be run in dev!");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

async function main() {
  console.log("🚀 Start Seeding...");

  console.log("🧨 Deleting Data...");

  await prisma.review.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️ Done delete!");

  const userStatusKeys = Object.keys(UserStatus) as (keyof typeof UserStatus)[];

  const usersData: Prisma.UserCreateManyInput[] = Array.from(
    { length: 100 },
    (_, i) => ({
      email: `user${i + 1}@mail.com`,
      username: `username${i + 1}`,
      password: faker.internet.password(),
      roles: ["USER"],
      status:
        UserStatus[
          userStatusKeys[Math.floor(Math.random() * userStatusKeys.length)]
        ],
      fullName: faker.person.fullName(),
      phone: faker.phone.number(),
      avatar: faker.image.avatar(),
    }),
  );

  await prisma.user.createMany({
    data: usersData,
  });

  await prisma.user.create({
    data: {
      email: "admin@localhost",
      username: "admin",
      password: "123456",
      roles: ["ADMIN"],
      status: "ACTIVE",
      fullName: "Admin",
      phone: "08123456789",
      avatar: faker.image.avatar(),
    },
  });
  console.log("👥 Users seeded: 100");

  const categoriesData: Prisma.CategoryCreateManyInput[] = Array.from(
    { length: 20 },
    () => ({
      name: faker.commerce.department(),
    }),
  );

  await prisma.category.createMany({ data: categoriesData });

  console.log("🏷️ Categories seeded: 20");

  const categories = await prisma.category.findMany();

  const productStatusKeys = Object.keys(
    ProductStatus,
  ) as (keyof typeof ProductStatus)[];

  for (let i = 1; i <= 1000; i++) {
    const product = await prisma.product.create({
      data: {
        name: `Product ${i} - ${faker.commerce.productName()}`,
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        status:
          ProductStatus[
            productStatusKeys[
              Math.floor(Math.random() * productStatusKeys.length)
            ]
          ],
        images: [faker.image.url()],
      },
    });

    const categoryCount = faker.number.int({ min: 1, max: 5 });
    const randomCategories = faker.helpers.arrayElements(
      categories,
      categoryCount,
    );

    for (const cat of randomCategories) {
      await prisma.productCategory.create({
        data: {
          productId: product.id,
          categoryId: cat.id,
        },
      });
    }

    if (i % 100 === 0) console.log(`📦 Products seeded: ${i}`);
  }

  console.log("📦 Products seeded: 1000");

  console.log("✍️ Seeding Reviews...");

  const users = await prisma.user.findMany({ select: { id: true } });
  const products = await prisma.product.findMany({ select: { id: true } });

  const reviewsData: Prisma.ReviewCreateManyInput[] = [];
  const reviewPairs = new Set<string>();
  const reviewCount = 2000;

  for (let i = 0; i < reviewCount; i++) {
    const user = faker.helpers.arrayElement(users);
    const product = faker.helpers.arrayElement(products);

    const key = `${product.id}-${user.id}`;
    if (reviewPairs.has(key)) continue;

    reviewPairs.add(key);

    reviewsData.push({
      productId: product.id,
      userId: user.id,
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.words(4),
      comment: faker.lorem.paragraph(),
      isVerified: faker.datatype.boolean(),
    });
  }

  await prisma.review.createMany({
    data: reviewsData,
    skipDuplicates: true,
  });

  console.log(`⭐ Reviews seeded: ${reviewsData.length}`);

  console.log("🎉 SEEDING .....!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    void prisma.$disconnect();
    process.exit(1);
  });
