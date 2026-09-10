const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// ✅ GET All Notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications", details: err.message });
  }
});

// ✅ GET compatibility endpoint (/read-orders)
router.get("/read-orders", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications", details: err.message });
  }
});

// ✅ POST Create Notification
router.post("/", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();

    if (req.io) {
      req.io.emit("newNotification", notification);
    }

    res.status(201).json({ message: "Notification created", notification });
  } catch (err) {
    res.status(500).json({ error: "Failed to create notification", details: err.message });
  }
});

// ✅ PUT Mark Notification as Read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Marked as read", notification });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification", details: err.message });
  }
});

// ✅ PUT Mark Notification as Delivered
router.put("/:id/delivered", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { isDelivered: true, isRead: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Marked as delivered", notification });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification", details: err.message });
  }
});

// ✅ DELETE All Notifications
router.delete("/", async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear notifications", details: err.message });
  }
});

// ✅ DELETE Single Notification
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notification", details: err.message });
  }
});

module.exports = router;
