import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(reviews);
  } catch (err) {
    console.error("Error getting reviews:", err);
    res.status(500).json({ error: err.message });
  }
};

const getReviewByStoreId = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const parsedStoreId = parseInt(storeId);
    if (isNaN(parsedStoreId)) {
      return res.status(400).json({ error: "Invalid store ID" });
    }
    const reviews = await prisma.review.findMany({
      where: { storeId: parsedStoreId },
      include: { user: { select: { name: true } } },
    });
    res.json(reviews);
  } catch (err) {
    console.error("Error getting reviews by store ID:", err);
    res.status(500).json({ error: err.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const id = req.params.id;
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });
    res.json(review);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const deleteReviewById = async (req, res) => {
  try {
    const id = req.params.id;
    const review = await prisma.review.delete({
      where: { id: parseInt(id) },
    });
    res.json(review);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { userId, storeId, rating, comment } = req.body;

    if (!userId || !storeId || !rating || !comment) {
      return res.status(400).json({
        error: "User ID, storeId, rating, and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const storeExists = await prisma.store.findUnique({
      where: { id: parseInt(storeId) },
    });
    if (!storeExists) {
      return res.status(404).json({ error: "Store not found" });
    }

    const review = await prisma.review.create({
      data: {
        userId: parseInt(userId),
        storeId: parseInt(storeId),
        rating: parseInt(rating),
        comment,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    if (err.code === "P2003") {
      return res.status(400).json({
        error: "Invalid foreign key reference",
      });
    }
    res.status(500).json({ error: err.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id, rating, comment } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Review ID is required" });
    }
    const updatedData = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }
      updatedData.rating = rating;
    }
    if (comment !== undefined) {
      updatedData.comment = comment;
    }
    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: updatedData,
      include: {
        user: { select: { name: true, email: true } },
      },
    });
    res.json(review);
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ error: err.message });
  }
};
const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const reviews = await prisma.review.findMany({
      where: { userId: parseInt(userId) },
      include: { user: { select: { name: true, email: true } } },
    });
    res.json(reviews);
  } catch (err) {
    console.error("Error in fetching user Reviews:", err);
    res.status(500).json({ error: err.message });
  }
};

const getReviewsByRating = async (req, res) => {
  try {
    const rating = parseInt(req.params.rating);
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    const reviews = await prisma.review.findMany({
      where: { rating },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(reviews);
  } catch (err) {
    console.error("Error getting reviews by rating:", err);
    res.status(500).json({ error: err.message });
  }
};

const getRecentReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default to 10 reviews
    const reviews = await prisma.review.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(reviews);
  } catch (err) {
    console.error("Error getting recent reviews:", err);
    res.status(500).json({ error: err.message });
  }
};

const getReviewStats = async (req, res) => {
  try {
    const stats = await prisma.$transaction([
      // Get average rating
      prisma.review.aggregate({
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      }),
      // Get count by rating
      prisma.review.groupBy({
        by: ["rating"],
        _count: {
          rating: true,
        },
        orderBy: {
          rating: "desc",
        },
      }),
    ]);

    const [aggregates, ratingDistribution] = stats;

    res.json({
      averageRating: aggregates._avg.rating,
      totalReviews: aggregates._count.id,
      ratingDistribution: ratingDistribution.map((item) => ({
        rating: item.rating,
        count: item._count.rating,
      })),
    });
  } catch (err) {
    console.error("Error getting review statistics:", err);
    res.status(500).json({ error: err.message });
  }
};

const getReviewsByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const reviews = await prisma.review.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(reviews);
  } catch (err) {
    console.error("Error getting reviews by date range:", err);
    res.status(500).json({ error: err.message });
  }
};

export {
  getAllReviews,
  createReview,
  getReviewById,
  deleteReviewById,
  updateReview,
  getUserReviews,
  getReviewsByRating,
  getRecentReviews,
  getReviewStats,
  getReviewsByDateRange,
  getReviewByStoreId,
};
