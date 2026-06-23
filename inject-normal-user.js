import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      displayName: "Normal User",
      name: "user",
      description: "Default role for normal users",
    },
  });

  const plainPassword = "1"; // as requested
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const email = "normal1@example.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(
      `User with email ${email} already exists (id=${existing.id}). Updating password and ensuring role.`,
    );
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    const existingRole = await prisma.userRole.findFirst({
      where: { userId: existing.id, roleId: userRole.id },
    });
    if (!existingRole) {
      await prisma.userRole.create({
        data: { userId: existing.id, roleId: userRole.id },
      });
      console.log(`Assigned 'user' role to existing user ${email}`);
    }

    console.log("Done.");
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "Normal User",
      email,
      password: hashedPassword,
      active: true,
    },
  });

  await prisma.userRole.create({
    data: { userId: user.id, roleId: userRole.id },
  });
  console.log(
    `Inserted user ${email} with id=${user.id}. Password set to '1' (hashed in DB).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
