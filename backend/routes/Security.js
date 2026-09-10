const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// ✅ GET Security Settings
router.get("/settings", authenticateAdmin, async (req, res) => {
  try {
    res.json({
      twoFactorEnabled: false,
      sessionTimeoutMinutes: 15,
      failedLoginAlerts: true,
      lastPasswordChange: new Date(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch security settings" });
  }
});

// ✅ PUT Change Password
router.put("/change-password", authenticateAdmin, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required." });
    }

    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: "Password changed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error updating password", details: err.message });
  }
});

module.exports = router;
