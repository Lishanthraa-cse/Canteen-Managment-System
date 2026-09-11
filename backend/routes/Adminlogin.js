const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const ActivityLog = require("../models/ActivityLog");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// Helper to log admin actions
const logAction = async (action, details, ip = "127.0.0.1", adminEmail = "admin@srec.ac.in", status = "Success") => {
  try {
    await ActivityLog.create({ action, details, ip, adminEmail, status });
  } catch (e) {
    console.error("Failed to log activity:", e.message);
  }
};

// ✅ Admin Login (supports POST / and POST /login)
const handleAdminLogin = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection?.remoteAddress || "127.0.0.1";

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: trimmedEmail });
    if (!admin) {
      await logAction("Failed Login", `Unknown email: ${trimmedEmail}`, ip, trimmedEmail, "Failed");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, admin.password);
    } catch (e) {
      isMatch = false;
    }

    // Graceful fallback for legacy plain text passwords
    if (!isMatch && password === admin.password) {
      isMatch = true;
      admin.password = await bcrypt.hash(password, 10);
      await admin.save();
    }

    if (!isMatch) {
      await logAction("Failed Login", `Incorrect password for: ${trimmedEmail}`, ip, trimmedEmail, "Failed");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role || "admin" },
      process.env.JWT_SECRET || "srec_super_secure_jwt_secret_2025",
      { expiresIn: "1d" }
    );

    await logAction("Admin Login", "Logged into Admin Dashboard", ip, trimmedEmail, "Success");

    res.json({
      message: "Admin login successful!",
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name || "Admin", role: admin.role },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error during admin login", details: err.message });
  }
};

router.post("/login", handleAdminLogin);
router.post("/", handleAdminLogin);

// ✅ GET Dashboard Analytics & Stats (KPIs, Charts data, Today's metrics)
router.get("/dashboard-stats", authenticateAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [allOrders, todayOrders, menuItems, pendingOrders] = await Promise.all([
      Order.find(),
      Order.find({ createdAt: { $gte: today } }),
      MenuItem.find(),
      Order.countDocuments({ status: "Pending" }),
    ]);

    const totalRevenue = allOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const todayRevenue = todayOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const totalMenuItems = menuItems.length;
    const outOfStockItems = menuItems.filter((i) => !i.availability).length;

    // Aggregate category distribution
    const categoryCounts = {};
    menuItems.forEach((item) => {
      const cat = item.category || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Last 7 days revenue calculation for charts
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const dayOrders = allOrders.filter((o) => {
        const oDate = new Date(o.createdAt);
        return oDate >= dayStart && oDate <= dayEnd;
      });

      const daySales = dayOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
      const label = dayStart.toLocaleDateString("en-US", { weekday: "short" });
      last7Days.push({ label, sales: daySales, orders: dayOrders.length });
    }

    res.json({
      totalRevenue,
      todayRevenue,
      totalOrders: allOrders.length,
      todayOrdersCount: todayOrders.length,
      pendingOrdersCount: pendingOrders,
      totalMenuItems,
      outOfStockItems,
      categoryCounts,
      chartData: last7Days,
      recentOrders: allOrders.slice(-5).reverse(),
    });
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats", details: err.message });
  }
});

// ✅ GET Admin Activity Logs
router.get("/logs", authenticateAdmin, async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs", details: err.message });
  }
});

// ✅ PUT Change Password
router.put("/change-password", authenticateAdmin, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    await logAction("Changed Password", "Admin password successfully updated", req.ip, admin.email);

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password", details: err.message });
  }
});

module.exports = router;
