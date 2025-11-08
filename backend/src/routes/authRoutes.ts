import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  refreshAccessToken,
  logoutUser,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

//  Register & Login
router.post("/register", registerUser);
router.post("/login", loginUser);

//  Protected Route
router.get("/profile", protect, getProfile);

//  Refresh & 🚪 Logout
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
