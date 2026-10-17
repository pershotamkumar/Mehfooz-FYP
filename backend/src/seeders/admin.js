import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@trustpay.com";

    
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("ℹ️ Admin account already exists (Seeder).");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "AdminSecure123@", 
      salt
    );

    
    await User.create({
      name: "Platform Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });

    console.log(`✅ Default Admin created successfully: ${adminEmail}`);
  } catch (error) {
    console.error("❌ Error in admin seeder:", error.message);
  }
};