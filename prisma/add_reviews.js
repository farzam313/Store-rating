import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MIN_REVIEWS_PER_STORE = 15;
const reviewTemplates = [
  (store, index) => ({
    comment: `Absolutely loved the experience at ${store.name}. Friendly staff and a welcoming atmosphere! (${index + 1})`,
    rating: 5,
  }),
  (store, index) => ({
    comment: `Good service at ${store.name}. The pricing felt fair and the team was helpful. (${index + 1})`,
    rating: 4,
  }),
  (store, index) => ({
    comment: `${store.name} has a nice setup and great attention to detail. I would visit again. (${index + 1})`,
    rating: 5,
  }),
  (store, index) => ({
    comment: `The location of ${store.name} is convenient, and the overall quality was impressive. (${index + 1})`,
    rating: 4,
  }),
  (store, index) => ({
    comment: `The experience at ${store.name} exceeded expectations with fast service and a friendly team. (${index + 1})`,
    rating: 5,
  }),
];

async function main() {
  const stores = await prisma.store.findMany({
    include: { reviews: true },
    orderBy: { createdAt: "asc" },
  });

  if (stores.length === 0) {
    console.log("No stores found in the database. Please seed stores first.");
    return;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    take: 5,
  });

  if (users.length === 0) {
    console.log("No users found in the database. Please seed users first.");
    return;
  }

  const reviewData = [];
  let userIndex = 0;

  for (const store of stores) {
    const currentCount = store.reviews.length;
    const neededCount = Math.max(0, MIN_REVIEWS_PER_STORE - currentCount);

    for (let i = 0; i < neededCount; i += 1) {
      const review = reviewTemplates[
        (currentCount + i) % reviewTemplates.length
      ](store, currentCount + i);
      reviewData.push({
        ...review,
        userId: users[userIndex % users.length].id,
        storeId: store.id,
      });
      userIndex += 1;
    }
  }

  if (reviewData.length === 0) {
    console.log("All stores already have at least 15 reviews.");
    return;
  }

  const created = await prisma.review.createMany({
    data: reviewData,
  });

  console.log(`Created ${created.count} review(s) for existing stores.`);
}

main()
  .catch((error) => {
    console.error("Error adding reviews:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
