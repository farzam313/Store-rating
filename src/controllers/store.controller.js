import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all stores
const getAllStores = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [stores, totalStores] = await prisma.$transaction([
      prisma.store.findMany({
        skip: skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.store.count(),
    ]);
    const totalPages = Math.ceil(totalStores / limit);

    res.json({
      data: stores,
      meta: { totalStores, currentPage: page, totalPages, limit },
    });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get store by ID with reviews
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Store ID is required" });
    }

    const store = await prisma.store.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(store);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new store
const createStore = async (req, res) => {
  try {
    const { name, description, address, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: "Name and userId are required" });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const store = await prisma.store.create({
      data: {
        name,
        description: description || null,
        address: address || null,
        userId: parseInt(userId),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json(store);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update store
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Store ID is required" });
    }

    const store = await prisma.store.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(store);
  } catch (error) {
    console.error("Error details:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Store not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete store
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Store ID is required" });
    }

    const store = await prisma.store.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Store deleted successfully", store });
  } catch (error) {
    console.error("Error details:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Store not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get stores by user ID
const getStoresByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const stores = await prisma.store.findMany({
      where: { userId: parseInt(userId) },
      include: {
        reviews: true,
      },
    });

    res.json(stores);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Search stores by name
const searchStores = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const stores = await prisma.store.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        reviews: true,
      },
    });

    res.json(stores);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  getStoresByUserId,
  searchStores,
};
