const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  image: {
    type: String,
    default: "",
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      default: "Student",
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    phone: {
      type: String,
      default: "Not Provided",
    },
    tableNumber: {
      type: String,
      default: "Counter Pickup",
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "UNPAID", "PENDING", "REFUNDED"],
      default: "PAID",
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "Cash", "NetBanking"],
      default: "UPI",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"],
      default: "Pending",
      index: true,
    },
    orderType: {
      type: String,
      enum: ["normal", "scheduled"],
      default: "normal",
    },
    scheduleTime: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate human-readable order number before saving
OrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(100 + Math.random() * 900);
    this.orderNumber = `ORD-${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);

