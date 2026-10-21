import User from "../models/user.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, addresses } = req.body;

    // 1. Validate JWT secret BEFORE creating the user
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: JWT_SECRET is missing",
      });
    }

    // 2. Prevent public admin registration
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be registered publicly.",
      });
    }

    // 3. Check existing user
    const userExists = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create user only after configuration checks pass
    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || "customer",
      phone,
      addresses: addresses || [],
      isVerified: role === "seller" ? false : true,
    });

    // 6. Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email); 
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ success: false, message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.body.name !== undefined) {
      user.name = req.body.name;
    }

    if (req.body.email !== undefined) {
      const emailExists = await User.findOne({
        email: req.body.email,
      });

      if (
        emailExists &&
        emailExists._id.toString() !== user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }

      user.email = req.body.email;
    }

    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    if (req.body.addresses !== undefined) {
      user.addresses = req.body.addresses;
    }

    // Optional Seller Store Details
    if (req.body.store !== undefined) {
      if (user.role !== "seller") {
        return res.status(403).json({
          success: false,
          message: "Only sellers can update store details",
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
          message: "Invalid store details",
        });
      }

      // Preserve existing optional fields not included in the request.
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

    // Existing Password Update Logic
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        addresses: updatedUser.addresses,
        isVerified: updatedUser.isVerified,
        store: updatedUser.store,
      },
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};