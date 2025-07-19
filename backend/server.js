const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const reviewRoutes = require("./routes/reviewRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/feedbackloop",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use("/api/reviews", reviewRoutes);
app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`✅ API running at http://localhost:${PORT}`)
);
