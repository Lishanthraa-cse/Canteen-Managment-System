const express = require("express");
const Feedback = require("../models/Feedback");

const router = express.Router();

// ✅ POST Feedback
router.post("/", async (req, res) => {
  const { email, rating, feedback } = req.body;
  try {
    const newFeedback = new Feedback({ email, rating, feedback });
    await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// ✅ GET Feedback for Admin Page
router.get("/", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

module.exports = router;
