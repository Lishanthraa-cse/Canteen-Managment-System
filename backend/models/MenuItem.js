const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "",
      default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    },
    availability: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      default: "",
      required: true,
      trim: true,
      default: "Snacks",
    },
    description: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    isVeg: {
      type: Boolean,
      default: true,
    },
    prepTime: {
      type: String,
      default: "10-15 mins",
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", MenuItemSchema);
