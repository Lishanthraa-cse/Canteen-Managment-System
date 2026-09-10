const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Notification = require("../models/Notification");
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

// ✅ POST Create Order (Used by Checkout & Schedule Orders)
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      tableNumber,
      items,
      totalAmount,
      paymentStatus,
      paymentMethod,
      orderType,
      scheduleTime,
      notes,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount." });
    }

    // Format items
    const formattedItems = items.map((it) => ({
      name: it.name,
      price: Number(it.price),
      quantity: Number(it.quantity) || 1,
      image: it.image || "",
    }));

    const newOrder = new Order({
      customerName: customerName || (email ? email.split("@")[0] : "Student"),
      email: email || "guest@srec.ac.in",
      phone: phone || "Not Provided",
      tableNumber: tableNumber || "Counter Pickup",
      items: formattedItems,
      totalAmount: Number(totalAmount),
      paymentStatus: paymentStatus || "PAID",
      paymentMethod: paymentMethod || "UPI",
      status: "Pending",
      orderType: orderType || "normal",
      scheduleTime: scheduleTime || null,
      notes: notes || "",
    });

    await newOrder.save();

    // Create Notification for Admin
    const notifTitle = orderType === "scheduled" ? "📅 New Scheduled Order" : "🔔 New Order Received";
    const notifMsg = `Order ${newOrder.orderNumber} for ${newOrder.customerName} - Total: ₹${newOrder.totalAmount}`;

    const notification = new Notification({
      title: notifTitle,
      message: notifMsg,
      type: "success",
      orderRef: newOrder._id,
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      email: newOrder.email,
      tableNumber: newOrder.tableNumber,
      scheduleTime: newOrder.scheduleTime,
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
    });
    await notification.save();

    // Real-time broadcast to Admin dashboard via Socket.IO
    if (req.io) {
      req.io.emit("newOrder", {
        order: newOrder,
        notification,
      });
    }

    res.status(201).json({
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order", details: err.message });
  }
});

// ✅ GET All Orders (with search, status filter, and pagination)
router.get("/", async (req, res) => {
  try {
    const { search, status, paymentStatus, orderType, email } = req.query;
    let query = {};

    if (email) {
      query.email = new RegExp(`^${email}$`, "i");
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== "ALL") {
      query.paymentStatus = paymentStatus;
    }

    if (orderType && orderType !== "ALL") {
      query.orderType = orderType;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { orderNumber: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
});

// ✅ GET Orders Compatibility endpoint for ViewMyOrder (/read-orders)
router.get("/read-orders", async (req, res) => {
  try {
    const { email } = req.query;
    let query = { orderType: "normal" };
    if (email) query.email = new RegExp(`^${email}$`, "i");

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
});

// ✅ GET User Orders by Email (/my-orders)
router.get("/my-orders", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email query param is required." });
    }

    const orders = await Order.find({ email: new RegExp(`^${email}$`, "i") }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user orders", details: err.message });
  }
});

// ✅ GET Single Order by ID or Order Number (For Real-Time Tracking)
router.get("/:id", async (req, res) => {
  try {
    let order;
    if (req.params.id.startsWith("ORD-")) {
      order = await Order.findOne({ orderNumber: req.params.id });
    } else {
      order = await Order.findById(req.params.id);
    }

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order", details: err.message });
  }
});

// ✅ PATCH Update Order Status (Admin 1-Click: Confirmed, Preparing, Ready, Completed, Cancelled)
router.patch("/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    await logAction("Updated Order Status", `Order ${order.orderNumber} changed to ${status}`, req.ip);

    // Broadcast status change to user & admin rooms in real-time
    if (req.io) {
      req.io.emit("orderStatusUpdated", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        email: order.email,
        updatedAt: order.updatedAt,
      });
    }

    res.json({ message: `Order status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status", details: err.message });
  }
});

// ✅ PATCH Update Payment Status
router.patch("/:id/payment", authenticateAdmin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { paymentStatus } },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: `Payment status updated to ${paymentStatus}`, order });
  } catch (err) {
    res.status(500).json({ error: "Failed to update payment status", details: err.message });
  }
});

// ✅ DELETE Order
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await logAction("Deleted Order", `Deleted order ${order.orderNumber}`, req.ip);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order", details: err.message });
  }
});

module.exports = router;
