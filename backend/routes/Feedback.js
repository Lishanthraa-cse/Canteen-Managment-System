const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const authenticateAdmin = require("../middleware/authenticateAdmin");

const router = express.Router();

// ✅ POST Feedback
router.post("/", async (req, res) => {
  const { email, rating, feedback } = req.body;
  const { email, rating, feedback, customerName } = req.body;
  try {
    const newFeedback = new Feedback({ email, rating, feedback });
    if (!email || !rating || !feedback) {
      return res.status(400).json({ message: "Email, rating, and feedback are required." });
    }

    const newFeedback = new Feedback({
      email,
      rating: Number(rating),
      feedback: feedback.trim(),
      customerName: customerName || email.split("@")[0],
    });
    await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });

    if (req.io) {
      req.io.emit("newFeedback", newFeedback);
    }

    res.status(201).json({ message: "Feedback submitted successfully!", feedback: newFeedback });
  } catch (err) {
    res.status(500).json({ error: "Failed to save feedback" });
    res.status(500).json({ error: "Failed to save feedback", details: err.message });
  }
});

// ✅ GET Feedback for Admin Page
// ✅ GET Feedback
router.get("/", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedback);
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    const totalReviews = feedbacks.length;
    const avgRating =
      totalReviews > 0
        ? (feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / totalReviews).toFixed(1)
        : "5.0";

    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedback" });
    res.status(500).json({ error: "Failed to fetch feedback", details: err.message });
  }
});

// ✅ DELETE Feedback (Admin)
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete feedback", details: err.message });
  }
});

module.exports = router;
