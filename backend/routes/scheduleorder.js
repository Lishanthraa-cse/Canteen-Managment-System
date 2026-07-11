const express = require("express");
const router = express.Router();

// ✅ POST Schedule Order
router.post("/", async (req, res) => {
  try {
    res.status(201).json({ message: "Order scheduled successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to schedule order" });
  }
});

// ✅ GET Scheduled Orders
router.get("/", async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
