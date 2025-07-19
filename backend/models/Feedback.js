const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  reviewSessionId: String,
  documentId: String,
  type: String, // "bug", "suggestion", "compliment"
  priority: String, // "low", "medium", "high"
  message: String,
  status: { type: String, default: "pending" }, // "pending", "resolved" etc.
  reviewer: {
    name: String,
    email: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
