const mongoose = require("mongoose");

const ReviewSessionSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  documentId: String,
  documentTitle: String,
  reviewUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ReviewSession", ReviewSessionSchema);
