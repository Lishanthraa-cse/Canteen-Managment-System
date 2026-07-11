const express = require("express");
const router = express.Router();

// ✅ GET Specials
router.get("/", async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch specials" });
  }
});

module.exports = router;
