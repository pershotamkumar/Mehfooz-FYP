import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  totalAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "held", "released", "refunded"], 
    default: "held" // Funds held until order confirmation[cite: 2]
  },
  orderStatus: { 
    type: String, 
    enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Returned"], 
    default: "Processing" 
  },
  deliveredAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);