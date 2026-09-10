const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Notification = require("../models/Notification");

// ✅ POST Schedule Order
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      tableNumber,
      scheduleTime,
      items,
      totalAmount,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items selected." });
    }

    const newOrder = new Order({
      customerName: customerName || "Student",
      email: email || "student@srec.ac.in",
      phone: phone || "Not Provided",
      tableNumber: tableNumber || "Takeaway",
      scheduleTime: scheduleTime,
      items,
      totalAmount: Number(totalAmount) || 0,
      orderType: "scheduled",
      paymentStatus: "PAID",
      status: "Pending",
    });

    await newOrder.save();

    const notif = new Notification({
      title: "📅 Scheduled Order Received",
      message: `Order for ${newOrder.customerName} scheduled at ${scheduleTime}. Total: ₹${newOrder.totalAmount}`,
      type: "info",
      orderRef: newOrder._id,
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      email: newOrder.email,
      tableNumber: newOrder.tableNumber,
      scheduleTime: newOrder.scheduleTime,
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
    });
    await notif.save();

    if (req.io) {
      req.io.emit("newOrder", { order: newOrder, notification: notif });
    }

    res.status(201).json({
      message: "✅ Order scheduled successfully!",
      order: newOrder,
    });
  } catch (err) {
    console.error("Failed to schedule order:", err);
    res.status(500).json({ error: "Failed to schedule order", details: err.message });
  }
});

// ✅ GET Scheduled Orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ orderType: "scheduled" }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scheduled orders", details: err.message });
  }
});

module.exports = router;
