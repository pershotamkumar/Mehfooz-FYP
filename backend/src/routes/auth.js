import express from "express";
import { 
  registerUser,  
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} from "../controllers/authController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (Requires valid JWT token)
router.get("/profile", protect, getUserProfile); 
router.put("/profile", protect, updateUserProfile);

export default router;