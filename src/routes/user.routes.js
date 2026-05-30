import express from "express";
import {
  getAllUsers,
  createUser,
  getUserById,
  removeUser,
  updateUser,
  changPassword,
  getPaginatedUsers,
  getUserByEmail,
  searchUsers,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/search", searchUsers);
router.put("/change-password", changPassword);

router.get("/paginated", getPaginatedUsers);
router.get("/by-email", getUserByEmail);

router.delete("/:id", removeUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);

export default router;
