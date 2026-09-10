const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "127.0.0.1",
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
    adminEmail: {
      type: String,
      default: "admin@srec.ac.in",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);

