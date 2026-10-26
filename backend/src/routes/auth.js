// import express from "express";
// import { 
//   registerUser,  
//   loginUser, 
//   getUserProfile, 
//   updateUserProfile 
// } from "../controllers/authController.js";
// import { protect } from "../utils/authMiddleware.js";

// const router = express.Router();

// // Public routes
// router.post("/register", registerUser);
// router.post("/login", loginUser);

// // Protected routes (Requires valid JWT token)
// router.get("/profile", protect, getUserProfile); 
// router.put("/profile", protect, updateUserProfile);

// export default router;

import express from "express";
import rateLimit from "express-rate-limit";

import {
  registerUser,
  requestLoginOtp,
  verifyLoginOtp,
  googleLogin,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";

import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

const otpRequestLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },
});

const otpVerifyLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later.",
  },
});

router.post("/register", registerUser);

router.post("/login-otp/request", otpRequestLimit, requestLoginOtp);
router.post("/login-otp/verify", otpVerifyLimit, verifyLoginOtp);

router.post("/google", googleLogin);

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export default router;
