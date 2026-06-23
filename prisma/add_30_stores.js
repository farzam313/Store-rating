import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Store names and descriptions for variety
const storeTemplates = [
  {
    name: "TechHub Electronics",
    description: "Latest gadgets and electronics at competitive prices",
  },
  {
    name: "StyleMax Fashion",
    description: "Trendy clothing and accessories for all seasons",
  },
  {
    name: "Daily Essentials Mart",
    description: "One-stop shop for daily groceries and essentials",
  },
  {
    name: "Books & Beyond",
    description: "Wide collection of books, magazines, and stationery",
  },
  {
    name: "Fitness First Gym",
    description: "State-of-the-art fitness center with expert trainers",
  },
  {
    name: "Gourmet Kitchen",
    description: "Premium kitchen appliances and cookware",
  },
  {
    name: "Beauty & Wellness",
    description: "Cosmetics, skincare, and wellness products",
  },
  {
    name: "Sports Arena",
    description: "Complete sports equipment and athletic gear",
  },
  {
    name: "Home Comfort Store",
    description: "Furniture and home decor for every room",
  },
  {
    name: "Quick Bites Café",
    description: "Fast food and beverages with quality taste",
  },
  {
    name: "Pharmacy Plus",
    description: "Medicines, health supplements, and wellness items",
  },
  {
    name: "Gaming Paradise",
    description: "Video games, consoles, and gaming accessories",
  },
  {
    name: "Jewelry Sparkle",
    description: "Authentic jewelry and luxury accessories",
  },
  {
    name: "Pet Paradise",
    description: "Pet supplies, food, and grooming services",
  },
  {
    name: "Auto Care Center",
    description: "Car maintenance and accessories shop",
  },
  {
    name: "Digital Solutions",
    description: "IT support and software solutions",
  },
  {
    name: "Flower Bliss",
    description: "Fresh flowers and floral arrangements",
  },
  {
    name: "Paint & Hardware",
    description: "Building materials and hardware supplies",
  },
  {
    name: "Music Haven",
    description: "Musical instruments and audio equipment",
  },
  {
    name: "Photography Studio",
    description: "Professional photography and printing services",
  },
  { name: "Craft Corner", description: "Arts, crafts, and DIY supplies" },
  {
    name: "Shoe Paradise",
    description: "Designer and casual footwear collection",
  },
  {
    name: "Garden Glory",
    description: "Plants, seeds, and gardening supplies",
  },
  {
    name: "Coffee Roastery",
    description: "Premium coffee beans and brewing equipment",
  },
  {
    name: "Tech Support Hub",
    description: "Device repair and tech support services",
  },
  { name: "Kids Zone Store", description: "Toys, games, and kids clothing" },
  {
    name: "Office Supplies Plus",
    description: "Complete office furniture and supplies",
  },
  {
    name: "Vintage Treasures",
    description: "Antiques and vintage collectibles",
  },
  { name: "Smoothie Bar", description: "Fresh juices and healthy smoothies" },
  { name: "Watch House", description: "Luxury watches and timepieces" },
];

async function main() {
  console.log("Adding 30 new stores to the database...");

  // Get all owner users (if not found, use any existing user)
  let owners = await prisma.user.findMany({
    where: { email: { in: ["owner1@example.com", "owner2@example.com"] } },
    orderBy: { id: "asc" },
  });

  // If specific owners not found, get any available users
  if (owners.length === 0) {
    owners = await prisma.user.findMany({ take: 2 });
  }

  if (owners.length === 0) {
    throw new Error(
      "No users found in database. Please run the seed script first to create users.",
    );
  }

  console.log(`Using ${owners.length} owner(s) to distribute stores...`);

  const created = [];
  const skipped = [];

  // Get current max store id to ensure unique addresses
  const maxStore = await prisma.store.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });
  const startIdx = (maxStore?.id || 0) + 1;

  for (let i = 0; i < 30; i++) {
    const template = storeTemplates[i % storeTemplates.length];
    const storeNum = startIdx + i;
    const owner = owners[i % owners.length];

    const storeName = `${template.name} - ${storeNum}`;
    const address = `${100 + storeNum} Commerce Street`;

    // Check for duplicates
    const exists = await prisma.store.findFirst({
      where: { name: storeName, address },
    });

    if (exists) {
      console.log(`⏭️  Skipping duplicate: ${storeName}`);
      skipped.push(storeName);
      continue;
    }

    try {
      const store = await prisma.store.create({
        data: {
          name: storeName,
          description: `${template.description} | Location #${storeNum}`,
          address,
          userId: owner.id,
        },
      });
      created.push(store);
      console.log(
        `✅ Created: ${store.name} (id=${store.id}) at ${store.address}`,
      );
    } catch (error) {
      console.error(`❌ Error creating store ${storeName}:`, error.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${created.length} stores`);
  console.log(`   ⏭️  Skipped: ${skipped.length} stores`);

  const totalStores = await prisma.store.count();
  console.log(`   📦 Total stores in database: ${totalStores}`);
}

main()
  .catch((e) => {
    console.error("Error adding stores:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
