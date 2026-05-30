import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing existing data...");
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.review.deleteMany();
  await prisma.store.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Seeding database...");

  // --- Roles ---
  const roleData = [
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
  ];
  const roles = await prisma.role.createMany({ data: roleData });
  console.log("✅ Roles seeded.");

  // --- Permissions ---
  const permissionData = [
    { name: "create_store", displayName: "Create Store" },
    { name: "edit_store", displayName: "Edit Store" },
    { name: "view_reviews", displayName: "View Reviews" },
    { name: "respond_reviews", displayName: "Respond to Reviews" },
    { name: "delete_user", displayName: "Delete User" },
  ];
  await prisma.permission.createMany({ data: permissionData });
  console.log("✅ Permissions seeded.");

  // --- Users ---
  const adminPassword = "1";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const usersData = [
    {
      email: "admin1@example.com",
      name: "Admin One",
      password: hashedPassword,
      active: true,
    },
    {
      email: "owner1@example.com",
      name: "Store Owner One",
      password: hashedPassword,
      active: true,
    },
    {
      email: "owner2@example.com",
      name: "Store Owner Two",
      password: hashedPassword,
      active: true,
    },
  ];

  await prisma.user.createMany({ data: usersData });
  console.log("✅ Users seeded.");

  const [adminUser, ownerUser1, ownerUser2] = await prisma.user.findMany({
    where: {
      email: {
        in: ["admin1@example.com", "owner1@example.com", "owner2@example.com"],
      },
    },
    orderBy: { email: "asc" },
  });

  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  const storeOwnerRole = await prisma.role.findUnique({
    where: { name: "store_owner" },
  });

  if (!adminRole || !storeOwnerRole) {
    throw new Error("Required roles were not seeded correctly.");
  }

  // --- UserRoles ---
  await prisma.userRole.createMany({
    data: [
      { userId: adminUser.id, roleId: adminRole.id },
      { userId: ownerUser1.id, roleId: storeOwnerRole.id },
      { userId: ownerUser2.id, roleId: storeOwnerRole.id },
    ],
  });
  console.log("✅ User roles seeded.");

  const permissions = await prisma.permission.findMany();

  // --- RolePermissions ---
  const rolePermissionsData = [
    {
      roleId: adminRole.id,
      permissionId: permissions.find((p) => p.name === "create_store").id,
    },
    {
      roleId: adminRole.id,
      permissionId: permissions.find((p) => p.name === "edit_store").id,
    },
    {
      roleId: adminRole.id,
      permissionId: permissions.find((p) => p.name === "view_reviews").id,
    },
    {
      roleId: adminRole.id,
      permissionId: permissions.find((p) => p.name === "respond_reviews").id,
    },
    {
      roleId: adminRole.id,
      permissionId: permissions.find((p) => p.name === "delete_user").id,
    },
    {
      roleId: storeOwnerRole.id,
      permissionId: permissions.find((p) => p.name === "create_store").id,
    },
    {
      roleId: storeOwnerRole.id,
      permissionId: permissions.find((p) => p.name === "edit_store").id,
    },
    {
      roleId: storeOwnerRole.id,
      permissionId: permissions.find((p) => p.name === "view_reviews").id,
    },
  ];
  await prisma.rolePermission.createMany({ data: rolePermissionsData });
  console.log("✅ Role permissions seeded.");

  // --- Stores ---
  const stores = await prisma.store.createMany({
    data: [
      {
        name: "Downtown Books",
        description: "A cozy shop for reading lovers.",
        address: "123 Main St",
        userId: ownerUser1.id,
      },
      {
        name: "Cafe Corner",
        description: "Fresh coffee and pastries every morning.",
        address: "456 Market St",
        userId: ownerUser2.id,
      },
      {
        name: "Tech Repair",
        description: "Fast device repair and support.",
        address: "789 Elm St",
        userId: ownerUser2.id,
      },
    ],
  });
  console.log("✅ Stores seeded.");

  const storeRecords = await prisma.store.findMany();

  // --- Reviews ---
  const reviewsData = [
    {
      comment: "Great selection and helpful staff.",
      rating: 5,
      userId: adminUser.id,
      storeId: storeRecords[0].id,
    },
    {
      comment: "Nice atmosphere, but a bit crowded.",
      rating: 4,
      userId: adminUser.id,
      storeId: storeRecords[1].id,
    },
    {
      comment: "Fast service and good prices.",
      rating: 4,
      userId: ownerUser1.id,
      storeId: storeRecords[2].id,
    },
  ];
  await prisma.review.createMany({ data: reviewsData });
  console.log("✅ Reviews seeded.");

  // --- Password Resets ---
  const resets = [
    { userId: adminUser.id, token: "resetToken1" },
    { userId: ownerUser1.id, token: "resetToken2" },
  ];
  await prisma.passwordReset.createMany({ data: resets });
  console.log("✅ Password resets seeded.");

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
