const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// Submit feedback for a session/document
router.post("/:reviewId/feedback", async (req, res) => {
  try {
    const { documentId, type, priority, message, reviewer } = req.body;
    const newFeedback = new Feedback({
      reviewSessionId: req.params.reviewId,
      documentId,
      type,
      priority,
      message,
      reviewer,
    });
    await newFeedback.save();
    res.status(201).json({ data: newFeedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update feedback status (resolve or other)
router.patch("/:feedbackId", async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(
      req.params.feedbackId,
      req.body,
      { new: true }
    );
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
