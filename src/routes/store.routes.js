import express from "express";
import {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  getStoresByUserId,
  searchStores,
} from "../controllers/store.controller.js";

const router = express.Router();

// Get all stores
router.get("/", getAllStores);

// Search stores by name
router.get("/search", searchStores);

// Get stores by user ID
router.get("/user/:userId", getStoresByUserId);

// Create a new store
router.post("/", createStore);

// Get store by ID
router.get("/:id", getStoreById);

// Update store
router.put("/:id", updateStore);

// Delete store
router.delete("/:id", deleteStore);

export default router;
