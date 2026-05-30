import express from "express";
import {
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
} from "../controllers/review.controller.js";

const router = express.Router();

router.get("/", getAllReviews);
router.post("/", createReview);
router.put("/", updateReview);
router.delete("/:id", deleteReviewById);
router.get("/recent", getRecentReviews);
router.get("/stats", getReviewStats);
router.get("/rating/:rating", getReviewsByRating);
router.get("/date", getReviewsByDateRange);
router.get("/user/:userId", getUserReviews);
router.get("/:id", getReviewById);

export default router;
