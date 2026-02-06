import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import pageRoutes from "./routes/pageRoutes.js";

dotenv.config();

const app = express();

// middleware
app.use(express.json());

// routes
app.use("/api/pages", pageRoutes);

const PORT = process.env.PORT || 5000;

// start server
await connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
