import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
// Import routes
import authRoutes from "./routes/auth.js";
import productRoutes from './routes/product.js';
dotenv.config();
 
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TrustPay API is running",
  });
});
app.use("/api/auth", authRoutes);
app.use('/api/products', productRoutes);

export default app;
