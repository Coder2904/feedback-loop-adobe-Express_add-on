const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const ReviewSession = require("../models/ReviewSession");
const Feedback = require("../models/Feedback");

// Create new review session
router.post("/", async (req, res) => {
  try {
    const { document } = req.body;
    const reviewId = uuidv4();
    const url = `https://feedback.review/${reviewId}`;
    await new ReviewSession({
      id: reviewId,
      documentId: document.id,
      documentTitle: document.title,
      reviewUrl: url,
    }).save();
    res.json({ id: reviewId, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback for a document
router.get("/:documentId/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find({
      documentId: req.params.documentId,
    }).sort({ createdAt: -1 });
    res.json({ data: feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
