import express from "express";
import {
  register,
  login,
  getCurrentUser,
  logout,
  refreshToken,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", authenticateToken, logout);

export default router;
