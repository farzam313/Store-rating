// seeduser.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      displayName: "Administrator",
      name: "admin",
      description: "Full access to all resources",
    },
  });

  const plainPassword = "01";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const users = [
    {
      name: "Admin One",
      email: "admin1@example.com",
      password: hashedPassword,
      active: true,
    },
    {
      name: "Admin Two",
      email: "admin2@example.com",
      password: hashedPassword,
      active: true,
    },
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`Skipped existing user: ${userData.email}`);
      const existingRole = await prisma.userRole.findFirst({
        where: { userId: existingUser.id, roleId: adminRole.id },
      });
      if (!existingRole) {
        await prisma.userRole.create({
          data: { userId: existingUser.id, roleId: adminRole.id },
        });
        console.log(`Assigned admin role to existing user: ${userData.email}`);
      }
      continue;
    }

    const user = await prisma.user.create({ data: userData });
    await prisma.userRole.create({
      data: { userId: user.id, roleId: adminRole.id },
    });
    console.log(`Inserted admin user: ${user.email}`);
  }

  console.log("All admin users processed!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
