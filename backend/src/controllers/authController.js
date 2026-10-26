// import User from "../models/user.js";
// import bcrypt from "bcryptjs";
// import generateToken from "../utils/jwt.js";

// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role, phone, addresses } = req.body;

//     // 1. Validate JWT secret BEFORE creating the user
//     if (!process.env.JWT_SECRET) {
//       return res.status(500).json({
//         success: false,
//         message: "Server configuration error: JWT_SECRET is missing",
//       });
//     }

//     // 2. Prevent public admin registration
//     if (role === "admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Admin accounts cannot be registered publicly.",
//       });
//     }

//     // 3. Check existing user
//     const userExists = await User.findOne({
//       email: email.trim().toLowerCase(),
//     });

//     if (userExists) {
//       return res.status(409).json({
//         success: false,
//         message: "User already exists with this email",
//       });
//     }

//     // 4. Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // 5. Create user only after configuration checks pass
//     const user = await User.create({
//       name,
//       email: email.trim().toLowerCase(),
//       password: hashedPassword,
//       role: role || "customer",
//       phone,
//       addresses: addresses || [],
//       isVerified: role === "seller" ? false : true,
//     });

//     // 6. Generate token
//     const token = generateToken(user._id);

//     return res.status(201).json({
//       success: true,
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       phone: user.phone,
//       addresses: user.addresses,
//       isVerified: user.isVerified,
//       token,
//     });
//   } catch (error) {
//     console.error("REGISTER ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Registration failed. Please try again.",
//     });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log("Login attempt for email:", email); 
//     const user = await User.findOne({ email });
//     if (user && (await bcrypt.compare(password, user.password))) {
//       res.json({
//         success: true,
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         phone: user.phone,
//         addresses: user.addresses,
//         isVerified: user.isVerified,
//         token: generateToken(user._id)
//       });
//     } else {
//       res.status(401).json({ success: false, message: "User Not Found" });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// export const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password");
//     if (user) {
//       res.json({ success: true, user });
//     } else {
//       res.status(404).json({ success: false, message: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// export const updateUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (req.body.name !== undefined) {
//       user.name = req.body.name;
//     }

//     if (req.body.email !== undefined) {
//       const emailExists = await User.findOne({
//         email: req.body.email,
//       });

//       if (
//         emailExists &&
//         emailExists._id.toString() !== user._id.toString()
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Email is already in use",
//         });
//       }

//       user.email = req.body.email;
//     }

//     if (req.body.phone !== undefined) {
//       user.phone = req.body.phone;
//     }

//     if (req.body.addresses !== undefined) {
//       user.addresses = req.body.addresses;
//     }

//     // Optional Seller Store Details
//     if (req.body.store !== undefined) {
//       if (user.role !== "seller") {
//         return res.status(403).json({
//           success: false,
//           message: "Only sellers can update store details",
//         });
//       }

//       const allowedStoreFields = [
//         "storeName",
//         "storeDescription",
//         "storeLogo",
//         "storeBanner",
//         "storeCategory",
//         "businessName",
//         "businessEmail",
//         "businessPhone",
//         "businessAddress",
//         "taxNumber",
//         "returnPolicy",
//         "shippingPolicy",
//       ];

//       const incomingStore = req.body.store;

//       if (
//         !incomingStore ||
//         typeof incomingStore !== "object" ||
//         Array.isArray(incomingStore)
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid store details",
//         });
//       }

//       // Preserve existing optional fields not included in the request.
//       const currentStore = user.store?.toObject
//         ? user.store.toObject()
//         : user.store || {};

//       const updatedStore = { ...currentStore };

//       for (const field of allowedStoreFields) {
//         if (incomingStore[field] !== undefined) {
//           updatedStore[field] = incomingStore[field];
//         }
//       }

//       user.set("store", updatedStore);
//       user.markModified("store");
//     }

//     // Existing Password Update Logic
//     if (req.body.password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(req.body.password, salt);
//     }

//     const updatedUser = await user.save();

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         role: updatedUser.role,
//         phone: updatedUser.phone,
//         addresses: updatedUser.addresses,
//         isVerified: updatedUser.isVerified,
//         store: updatedUser.store,
//       },
//       token: generateToken(updatedUser._id),
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import LoginOtp from "../models/LoginOtp.js";
import { firebaseAuth } from "../config/firebaseAdmin.js";
import { sendLoginOtp } from "../services/emailService.js";
import generateToken from "../utils/jwt.js";

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  addresses: user.addresses,
  isVerified: user.isVerified,
  emailVerified: user.emailVerified,
  store: user.store,
});

const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== "string") {
    const error = new Error("Firebase ID token is required.");
    error.status = 400;
    throw error;
  }

  return firebaseAuth.verifyIdToken(idToken, true);
};

const requireVerifiedEmail = (decoded) => {
  if (!decoded.email || decoded.email_verified !== true) {
    const error = new Error(
      "Please verify your email address before logging in."
    );
    error.status = 403;
    throw error;
  }
};

const ensureJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Server configuration error: JWT_SECRET is missing.");
  }
};

const getSafeError = (error) => ({
  status: error.status || 500,
  message:
    error.status && error.status < 500
      ? error.message
      : "Authentication failed. Please try again.",
});

// 1. Registration sync: Firebase account is created by the mobile app.
// The mobile app sends the Firebase ID token here.
export const registerUser = async (req, res) => {
  try {
    ensureJwtSecret();

    const { idToken, name, role, phone, addresses } = req.body;

    const decoded = await verifyFirebaseIdToken(idToken);
    const email = normalizeEmail(decoded.email);

    if (!email || !decoded.uid) {
      return res.status(400).json({
        success: false,
        message: "Firebase account email is missing.",
      });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be registered publicly.",
      });
    }

    const allowedRole = role === "seller" ? "seller" : "customer";

    let user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email }],
    });

    if (user) {
      // Don't silently attach a different Firebase identity to an
      // existing password-based or unrelated account.
      if (user.firebaseUid && user.firebaseUid !== decoded.uid) {
        return res.status(409).json({
          success: false,
          message:
            "An account already exists with this email. Please use its original sign-in method.",
        });
      }

      // Existing same-UID registration: update safe profile fields only.
      if (user.firebaseUid === decoded.uid) {
        user.name = String(name).trim();
        if (phone !== undefined) user.phone = phone;
        if (Array.isArray(addresses)) user.addresses = addresses;
        user.emailVerified = decoded.email_verified === true;
        await user.save();

        return res.status(200).json({
          success: true,
          message: user.emailVerified
            ? "Account synced successfully."
            : "Account synced. Verify your email before logging in.",
          user: publicUser(user),
          requiresEmailVerification: !user.emailVerified,
        });
      }

      // An old account with the same email must not be linked while
      // the Firebase email is unverified.
      if (decoded.email_verified !== true) {
        return res.status(409).json({
          success: false,
          message:
            "An account already exists with this email. Verify your email and sign in using the original account.",
        });
      }

      // A verified Firebase email can be linked only when the old
      // account is not already linked to a different Firebase UID.
      user.firebaseUid = decoded.uid;
      user.emailVerified = true;
      await user.save();
    } else {
      user = await User.create({
        name: String(name).trim(),
        email,
        firebaseUid: decoded.uid,
        role: allowedRole,
        phone,
        addresses: Array.isArray(addresses) ? addresses : [],
        emailVerified: decoded.email_verified === true,

        // Preserve the old application's isVerified meaning.
        isVerified: allowedRole === "customer",
      });
    }

    return res.status(201).json({
      success: true,
      message: user.emailVerified
        ? "Account synced successfully."
        : "Account created. Verify your email before logging in.",
      user: publicUser(user),
      requiresEmailVerification: !user.emailVerified,
    });
  } catch (error) {
    console.error("REGISTER/SYNC ERROR:", error);
    const safe = getSafeError(error);

    return res.status(safe.status).json({
      success: false,
      message: safe.message,
    });
  }
};

// 2. Request a login OTP after Firebase email/password sign-in.
export const requestLoginOtp = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decoded = await verifyFirebaseIdToken(idToken);

    requireVerifiedEmail(decoded);

    const email = normalizeEmail(decoded.email);

    const user = await User.findOne({
      firebaseUid: decoded.uid,
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account profile not found. Please register first.",
      });
    }

    user.emailVerified = true;
    await user.save();

    // Invalidate any previous unconsumed challenge for this account.
    await LoginOtp.updateMany(
      {
        userId: user._id,
        consumedAt: null,
      },
      { $set: { consumedAt: new Date() } }
    );

    const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
    const otpHash = crypto
      .createHash("sha256")
      .update(`${decoded.uid}:${otp}`)
      .digest("hex");

    const expiresMinutes = Math.max(
      1,
      Math.min(Number(process.env.OTP_EXPIRES_MINUTES) || 5, 10)
    );

    const challenge = await LoginOtp.create({
      userId: user._id,
      firebaseUid: decoded.uid,
      email,
      otpHash,
      expiresAt: new Date(Date.now() + expiresMinutes * 60 * 1000),
    });

    try {
      await sendLoginOtp(email, otp);
    } catch (emailError) {
      await LoginOtp.deleteOne({ _id: challenge._id });
      throw emailError;
    }

    return res.status(200).json({
      success: true,
      requiresOtp: true,
      challengeId: String(challenge._id),
      expiresInSeconds: expiresMinutes * 60,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("OTP REQUEST ERROR:", error);
    const safe = getSafeError(error);

    return res.status(safe.status).json({
      success: false,
      message: safe.message,
    });
  }
};

// 3. Verify OTP. Only this endpoint issues the TrustPay JWT for
// email/password login.
export const verifyLoginOtp = async (req, res) => {
  try {
    ensureJwtSecret();

    const { idToken, challengeId, otp } = req.body;

    if (
      !challengeId ||
      !/^\d{6}$/.test(String(otp || ""))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter the 6-digit verification code.",
      });
    }

    const decoded = await verifyFirebaseIdToken(idToken);
    requireVerifiedEmail(decoded);

    const challenge = await LoginOtp.findById(challengeId).select("+otpHash");

    if (!challenge || challenge.firebaseUid !== decoded.uid) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification request. Please log in again.",
      });
    }

    if (challenge.consumedAt) {
      return res.status(400).json({
        success: false,
        message: "This verification code has already been used.",
      });
    }

    if (challenge.expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Verification code expired. Please log in again.",
      });
    }

    if (challenge.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new code.",
      });
    }

    const submittedHash = crypto
      .createHash("sha256")
      .update(`${decoded.uid}:${String(otp)}`)
      .digest("hex");

    const matches = crypto.timingSafeEqual(
      Buffer.from(challenge.otpHash, "hex"),
      Buffer.from(submittedHash, "hex")
    );

    if (!matches) {
      challenge.attempts += 1;
      if (challenge.attempts >= 5) {
        challenge.consumedAt = new Date();
      }
      await challenge.save();

      return res.status(400).json({
        success: false,
        message:
          challenge.attempts >= 5
            ? "Too many incorrect attempts. Please request a new code."
            : "Incorrect verification code.",
      });
    }

    // Atomically consume the challenge so the same OTP cannot be
    // used again by a concurrent request.
    const consumed = await LoginOtp.findOneAndUpdate(
      {
        _id: challenge._id,
        firebaseUid: decoded.uid,
        consumedAt: null,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 5 },
      },
      { $set: { consumedAt: new Date() } },
      { new: true }
    );

    if (!consumed) {
      return res.status(400).json({
        success: false,
        message: "Verification code expired or already used.",
      });
    }

    const user = await User.findOne({
      _id: challenge.userId,
      firebaseUid: decoded.uid,
      email: normalizeEmail(decoded.email),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account profile not found.",
      });
    }

    user.emailVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      ...publicUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("OTP VERIFY ERROR:", error);
    const safe = getSafeError(error);

    return res.status(safe.status).json({
      success: false,
      message: safe.message,
    });
  }
};

// 4. Google login. Firebase client must sign in with Google first
// and send the resulting Firebase ID token here.
export const googleLogin = async (req, res) => {
  try {
    ensureJwtSecret();

    const decoded = await verifyFirebaseIdToken(req.body.idToken);
    requireVerifiedEmail(decoded);

    const provider = decoded.firebase?.sign_in_provider;
    if (provider !== "google.com") {
      return res.status(403).json({
        success: false,
        message: "Please sign in using Google.",
      });
    }

    const email = normalizeEmail(decoded.email);
    let user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email }],
    });

    if (user) {
      if (user.firebaseUid && user.firebaseUid !== decoded.uid) {
        return res.status(409).json({
          success: false,
          message:
            "This email is linked to another sign-in method. Use that method first.",
        });
      }

      user.firebaseUid = decoded.uid;
      user.emailVerified = true;

      if (!user.name && decoded.name) {
        user.name = decoded.name;
      }

      await user.save();
    } else {
      user = await User.create({
        name: decoded.name || email.split("@")[0],
        email,
        firebaseUid: decoded.uid,
        role: "customer",
        emailVerified: true,
        isVerified: true,
      });
    }

    return res.status(200).json({
      success: true,
      ...publicUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    const safe = getSafeError(error);

    return res.status(safe.status).json({
      success: false,
      message: safe.message,
    });
  }
};

// Existing profile route preserved.
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
};

// Existing profile update and seller store fields preserved.
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.addresses !== undefined) user.addresses = req.body.addresses;

    // Email changes require a separate verified-email flow.
    if (
      req.body.email !== undefined &&
      normalizeEmail(req.body.email) !== user.email
    ) {
      return res.status(400).json({
        success: false,
        message: "Email changes require email verification.",
      });
    }

    if (req.body.store !== undefined) {
      if (user.role !== "seller") {
        return res.status(403).json({
          success: false,
          message: "Only sellers can update store details.",
        });
      }

      const allowedStoreFields = [
        "storeName",
        "storeDescription",
        "storeLogo",
        "storeBanner",
        "storeCategory",
        "businessName",
        "businessEmail",
        "businessPhone",
        "businessAddress",
        "taxNumber",
        "returnPolicy",
        "shippingPolicy",
      ];

      const incomingStore = req.body.store;

      if (
        !incomingStore ||
        typeof incomingStore !== "object" ||
        Array.isArray(incomingStore)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid store details.",
        });
      }

      const currentStore = user.store?.toObject
        ? user.store.toObject()
        : user.store || {};

      const updatedStore = { ...currentStore };

      for (const field of allowedStoreFields) {
        if (incomingStore[field] !== undefined) {
          updatedStore[field] = incomingStore[field];
        }
      }

      user.set("store", updatedStore);
      user.markModified("store");
    }

    // Preserve password change for legacy accounts, if used.
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: publicUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};