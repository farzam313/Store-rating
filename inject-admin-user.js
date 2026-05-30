import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function injectAdminUser() {
  try {
    console.log("🔐 Injecting admin user into database...");

    // Hash the password
    const hashedPassword = await bcrypt.hash("1", 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: "k@c.com",
        name: "Karim",
        password: hashedPassword,
        active: true,
      },
    });

    console.log("✅ User created:", user);

    // Get the admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: "admin" },
    });

    if (!adminRole) {
      throw new Error("Admin role not found. Please ensure roles are seeded.");
    }

    // Assign admin role to user
    const userRole = await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });

    console.log("✅ Admin role assigned to user:", userRole);
    console.log("\n🎉 Admin user successfully injected!");
    console.log("   Username: Karim");
    console.log("   Email: k@c.com");
    console.log("   Password: 1");
    console.log("   Role: admin");
  } catch (error) {
    if (error.code === "P2002") {
      console.error(
        "❌ Error: User with email 'k@c.com' already exists in the database."
      );
    } else {
      console.error("❌ Error injecting admin user:", error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

injectAdminUser();
