const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Routers
const reviewRoutes = require("./routes/reviewRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/feedbackloop";

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Connect to MongoDB with explicit error handling and confirmation
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/reviews", reviewRoutes);
app.use("/api/feedback", feedbackRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Feedback Loop API running at http://localhost:${PORT}`);
});
