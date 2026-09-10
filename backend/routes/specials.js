const express = require("express");
const router = express.Router();
const Special = require("../models/Special");
const ActivityLog = require("../models/ActivityLog");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// Helper to log admin actions
const logAction = async (action, details, ip = "127.0.0.1") => {
  try {
    await ActivityLog.create({ action, details, ip, status: "Success" });
  } catch (e) {
    console.error("Failed to log activity:", e.message);
  }
};

// ✅ GET All Specials
router.get("/", async (req, res) => {
  try {
    const specials = await Special.find({ active: true }).sort({ createdAt: -1 });
    res.json(specials);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch specials", details: err.message });
  }
});

// ✅ POST Create Special
router.post("/", async (req, res) => {
  try {
    const { name, description, price, discountPrice, image, category } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "Special name and price are required." });
    }

    const newSpecial = new Special({
      name,
      description: description || "",
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
      category: category || "Chef's Special",
      active: true,
    });

    await newSpecial.save();
    await logAction("Added Special Offer", `Added ${newSpecial.name} (₹${newSpecial.price})`, req.ip);

    if (req.io) {
      req.io.emit("specialsUpdated", newSpecial);
    }

    res.status(201).json({ message: "Special offer created successfully!", special: newSpecial });
  } catch (err) {
    res.status(500).json({ error: "Failed to create special", details: err.message });
  }
});

// ✅ DELETE Special
router.delete("/:id", async (req, res) => {
  try {
    const special = await Special.findByIdAndDelete(req.params.id);
    if (!special) return res.status(404).json({ message: "Special not found" });

    await logAction("Deleted Special Offer", `Deleted ${special.name}`, req.ip);

    if (req.io) {
      req.io.emit("specialsUpdated", { deletedId: req.params.id });
    }

    res.json({ message: "Special offer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete special", details: err.message });
  }
});

module.exports = router;
