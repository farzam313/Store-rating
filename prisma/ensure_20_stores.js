import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Ensuring database has at least 20 stores...");

  const owners = await prisma.user.findMany({
    where: { email: { in: ["owner1@example.com", "owner2@example.com"] } },
    orderBy: { id: "asc" },
  });

  if (owners.length === 0) {
    throw new Error("No owner users found. Please run the seed script first.");
  }

  const currentCount = await prisma.store.count();
  console.log(`Current store count: ${currentCount}`);

  const target = 20;
  if (currentCount >= target) {
    console.log("No action needed — already have 20 or more stores.");
    return;
  }

  const toCreate = target - currentCount;
  console.log(`Creating ${toCreate} new stores...`);

  const created = [];
  for (let i = 1; i <= toCreate; i++) {
    const idx = currentCount + i;
    const owner = owners[i % owners.length];
    const name = `Generated Store ${idx}`;
    const address = `Auto Address ${idx}`;

    // Avoid duplicates by name+address
    const exists = await prisma.store.findFirst({ where: { name, address } });
    if (exists) {
      console.log(`Skipping duplicate: ${name}`);
      continue;
    }

    const s = await prisma.store.create({
      data: {
        name,
        description: `Auto-generated store #${idx}`,
        address,
        userId: owner.id,
      },
    });
    created.push(s);
    console.log(`Created: ${s.name} (id=${s.id})`);
  }

  console.log(`Finished — created ${created.length} stores.`);
}

main()
  .catch((e) => {
    console.error("Error ensuring stores:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
