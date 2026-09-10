const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");
const ActivityLog = require("../models/ActivityLog");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// Helper to log admin actions
const logAction = async (action, details, ip = "127.0.0.1", adminEmail = "admin@srec.ac.in") => {
  try {
    await ActivityLog.create({ action, details, ip, adminEmail, status: "Success" });
  } catch (e) {
    console.error("Failed to log activity:", e.message);
  }
};

// ✅ GET All Menu Items (with optional search, category, and veg filters)
router.get("/", async (req, res) => {
  try {
    const { category, search, vegOnly, availableOnly } = req.query;
    let filter = {};

    if (category && category !== "All") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (vegOnly === "true") {
      filter.isVeg = true;
    }

    if (availableOnly === "true") {
      filter.availability = true;
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu items", details: err.message });
  }
});

// ✅ GET Single Menu Item
router.get("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch item", details: err.message });
  }
});

// ✅ POST Create Menu Item
router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { name, price, category, image, description, isVeg, prepTime, availability, isSpecial, discountPrice } = req.body;
    if (!name || price === undefined || !category) {
      return res.status(400).json({ message: "Name, price, and category are required." });
    }

    const newItem = new MenuItem({
      name,
      price: Number(price),
      category,
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
      description: description || "",
      isVeg: isVeg !== undefined ? isVeg : true,
      prepTime: prepTime || "10-15 mins",
      availability: availability !== undefined ? availability : true,
      isSpecial: Boolean(isSpecial),
      discountPrice: discountPrice ? Number(discountPrice) : null,
    });

    await newItem.save();
    await logAction("Added Menu Item", `Added ${newItem.name} (₹${newItem.price}) in ${newItem.category}`, req.ip);

    // Emit real-time update
    if (req.io) {
      req.io.emit("menuUpdated", { type: "add", item: newItem });
    }

    res.status(201).json({ message: "Menu item added successfully!", item: newItem });
  } catch (err) {
    res.status(500).json({ error: "Failed to add menu item", details: err.message });
  }
});

// ✅ PUT Update Menu Item
router.put("/:id", authenticateAdmin, async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedItem) return res.status(404).json({ message: "Menu item not found" });

    await logAction("Updated Menu Item", `Updated ${updatedItem.name}`, req.ip);

    if (req.io) {
      req.io.emit("menuUpdated", { type: "update", item: updatedItem });
    }

    res.json({ message: "Menu item updated successfully!", item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: "Failed to update menu item", details: err.message });
  }
});

// ✅ PATCH Toggle Availability (1-Click for Admin)
router.patch("/:id/toggle", authenticateAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    item.availability = !item.availability;
    await item.save();

    await logAction(
      "Toggled Item Availability",
      `${item.name} is now ${item.availability ? "Available" : "Out of Stock"}`,
      req.ip
    );

    if (req.io) {
      req.io.emit("menuUpdated", { type: "toggle", item });
    }

    res.json({ message: `Item marked as ${item.availability ? "Available" : "Out of Stock"}`, item });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle availability", details: err.message });
  }
});

// ✅ DELETE Menu Item
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Menu item not found" });

    await logAction("Deleted Menu Item", `Deleted ${deletedItem.name}`, req.ip);

    if (req.io) {
      req.io.emit("menuUpdated", { type: "delete", id: req.params.id });
    }

    res.json({ message: "Menu item deleted successfully!", item: deletedItem });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu item", details: err.message });
  }
});

module.exports = router;
