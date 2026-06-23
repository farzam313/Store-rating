import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding two stores to the database...');

  const owner1 = await prisma.user.findUnique({ where: { email: 'owner1@example.com' } });
  const owner2 = await prisma.user.findUnique({ where: { email: 'owner2@example.com' } });

  if (!owner1 || !owner2) {
    throw new Error('Required owner users not found. Please run the main seed script first.');
  }

  const storesToAdd = [
    {
      name: 'Green Grocer',
      description: 'Fresh produce and local goods.',
      address: '12 Green St',
      userId: owner1.id,
    },
    {
      name: 'Sunny Salon',
      description: 'Haircuts, styling and grooming services.',
      address: '99 Beauty Ave',
      userId: owner2.id,
    },
  ];

  for (const s of storesToAdd) {
    const exists = await prisma.store.findFirst({ where: { name: s.name, address: s.address } });
    if (exists) {
      console.log(`Skipping existing store: ${s.name} (${s.address})`);
      continue;
    }

    const created = await prisma.store.create({ data: s });
    console.log(`Created store: ${created.name} (id=${created.id})`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error('Error adding stores:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
