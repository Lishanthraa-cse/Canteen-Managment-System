const express = require("express");
const router = express.Router();

// ✅ GET Notifications
router.get("/", async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

module.exports = router;
