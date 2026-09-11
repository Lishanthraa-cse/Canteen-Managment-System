const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// ✅ POST Feedback
router.post("/", async (req, res) => {
  const { email, rating, feedback, customerName } = req.body;
  try {
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

    if (req.io) {
      req.io.emit("newFeedback", newFeedback);
    }

    res.status(201).json({ message: "Feedback submitted successfully!", feedback: newFeedback });
  } catch (err) {
    res.status(500).json({ error: "Failed to save feedback", details: err.message });
  }
});

// ✅ GET Feedback
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
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
