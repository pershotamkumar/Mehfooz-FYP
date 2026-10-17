import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  availableBalance: { type: Number, default: 0 },
  heldBalance: { type: Number, default: 0 }, // Funds held in escrow[cite: 2]
  pendingBalance: { type: Number, default: 0 },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction"
  }]
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  description: { type: String }
}, { timestamps: true });

export const Wallet = mongoose.model("Wallet", walletSchema);
export const Transaction = mongoose.model("Transaction", transactionSchema);