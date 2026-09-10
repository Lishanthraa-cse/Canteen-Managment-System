const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const Feedback = require("../models/Feedback");
const Special = require("../models/Special");
const ActivityLog = require("../models/ActivityLog");
const authenticateAdmin = require("../middleware/authenticateAdmin");

const BACKUP_PATH = path.resolve(__dirname, "../backups");

if (!fs.existsSync(BACKUP_PATH)) {
  fs.mkdirSync(BACKUP_PATH, { recursive: true });
}

// ✅ GET Create Full Database JSON Snapshot (Cross-platform, no mongodump binary required)
router.get("/backup", async (req, res) => {
  try {
    const [menu, orders, feedbacks, specials, logs] = await Promise.all([
      MenuItem.find(),
      Order.find(),
      Feedback.find(),
      Special.find(),
      ActivityLog.find(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      canteen: "SREC Smart Canteen",
      version: "2.0.0",
      stats: {
        totalMenuItems: menu.length,
        totalOrders: orders.length,
        totalFeedbacks: feedbacks.length,
        totalSpecials: specials.length,
        totalLogs: logs.length,
      },
      data: {
        menu,
        orders,
        feedbacks,
        specials,
        logs,
      },
    };

    const fileName = `backup_${Date.now()}.json`;
    const filePath = path.join(BACKUP_PATH, fileName);
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    res.json({
      message: "✅ Database backup created successfully!",
      fileName,
      path: filePath,
      stats: backupData.stats,
    });
  } catch (err) {
    console.error("Backup creation failed:", err);
    res.status(500).json({ error: "Failed to generate database backup", details: err.message });
  }
});

// ✅ GET List Available Backups
router.get("/list", async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_PATH).filter((f) => f.endsWith(".json"));
    const backups = files.map((file) => {
      const stats = fs.statSync(path.join(BACKUP_PATH, file));
      return {
        fileName: file,
        sizeBytes: stats.size,
        createdAt: stats.birthtime,
      };
    });
    res.json(backups);
  } catch (err) {
    res.status(500).json({ error: "Failed to list backups" });
  }
});

module.exports = router;
