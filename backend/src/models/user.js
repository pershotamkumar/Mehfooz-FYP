import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["customer", "seller", "admin"], 
    default: "customer" 
  },
  phone: { type: String },
  isVerified: { type: Boolean, default: false }, // Seller/Customer verification
  addresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);