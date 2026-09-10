const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    orderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    customerName: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    tableNumber: {
      type: String,
      default: "",
    },
    scheduleTime: {
      type: String,
      default: null,
    },
    items: {
      type: Array,
      default: [],
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);

