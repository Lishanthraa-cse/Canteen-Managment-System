const mongoose = require("mongoose");

const SpecialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    },
    category: {
      type: String,
      default: "Chef's Special",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Special", SpecialSchema);

