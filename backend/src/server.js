
import app from "./app.js";
import connectDB from "./config/db.js";


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`TrustPay API running on port ${PORT}`);
  });
};

startServer();
