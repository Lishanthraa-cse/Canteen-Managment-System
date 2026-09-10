const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: "Student",
    },
    reply: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
