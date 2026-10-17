import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [{ type: String }], 
  ratingsAverage: { type: Number, default: 0 },
  ratingsQuantity: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);