import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing existing data...");
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.review.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Seeding database...");

  // --- Roles ---
  const roles = await prisma.role.createMany({
    data: [
      {
        displayName: "Administrator",
        name: "admin",
        description: "Full access to all resources",
      },
      {
        displayName: "User",
        name: "user",
        description: "Regular user with basic access",
      },
      {
        displayName: "Store Owner",
        name: "store_owner",
        description: "Can manage store info and respond to reviews",
      },
      {
        displayName: "Moderator",
        name: "moderator",
        description: "Can monitor reviews and user content",
      },
      {
        displayName: "Guest",
        name: "guest",
        description: "Limited access without registration",
      },
    ],
  });
  console.log("✅ Roles seeded.");

  // --- Permissions ---
  const permissions = await prisma.permission.createMany({
    data: [
      { name: "create_store", displayName: "Create Store" },
      { name: "edit_store", displayName: "Edit Store" },
      { name: "view_reviews", displayName: "View Reviews" },
      { name: "respond_reviews", displayName: "Respond to Reviews" },
      { name: "delete_user", displayName: "Delete User" },
    ],
  });
  console.log("✅ Permissions seeded.");

  // --- Users ---
  const adminPassword = " 1";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const users = [
    {
      email: "admin1@example.com",
      name: "Admin One",
      password: hashedPassword,
      active: true,
    },
    {
      email: "admin2@example.com",
      name: "Admin Two",
      password: hashedPassword,
      active: true,
    },
  ];
  await prisma.user.createMany({ data: users });
  console.log("✅ Admin users seeded.");

  // Fetch back inserted users and admin role
  const allUsers = await prisma.user.findMany({
    where: { email: { in: ["admin1@example.com", "admin2@example.com"] } },
  });
  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });

  if (!adminRole) {
    throw new Error("Admin role not found after seeding roles.");
  }

  // --- UserRoles (assign admin role) ---
  const userRoles = allUsers.map((u) => ({
    userId: u.id,
    roleId: adminRole.id,
  }));
  await prisma.userRole.createMany({ data: userRoles });
  console.log("✅ Admin UserRoles seeded.");

  // --- RolePermissions ---
  const rolePermissions = allRoles.map((r, idx) => ({
    roleId: r.id,
    permissionId: allPermissions[idx % allPermissions.length].id,
  }));
  await prisma.rolePermission.createMany({ data: rolePermissions });
  console.log("✅ RolePermissions seeded.");

  // --- Reviews ---
  const reviews = [];
  for (let i = 0; i < 5; i++) {
    reviews.push({
      comment: `This is review ${i + 1}`,
      rating: Math.floor(Math.random() * 5) + 1,
      userId: allUsers[i % allUsers.length].id,
    });
  }
  await prisma.review.createMany({ data: reviews });
  console.log("✅ Reviews seeded.");

  // --- Password Resets ---
  const resets = allUsers.map((u, i) => ({
    userId: u.id,
    token: `resetToken${i + 1}`,
  }));
  await prisma.passwordReset.createMany({ data: resets });
  console.log("✅ PasswordReset seeded.");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
