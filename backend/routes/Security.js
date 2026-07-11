const express = require("express");
const router = express.Router();

// ✅ Security Routes
router.get("/settings", async (req, res) => {
  try {
    res.json({ message: "Security settings" });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch security settings" });
  }
});

module.exports = router;
