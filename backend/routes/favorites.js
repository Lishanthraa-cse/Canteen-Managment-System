const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");

// Helper to resolve user from Bearer token or email param/body
const resolveUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "srec_super_secure_jwt_secret_2025"
      );
      if (decoded.userId) {
        return await User.findById(decoded.userId);
      }
      if (decoded.email) {
        return await User.findOne({ email: decoded.email.toLowerCase().trim() });
      }
    } catch (err) {
      // Token invalid or expired, fallback to query/body
    }
  }

  const email = req.query.email || req.body?.email;
  if (email && typeof email === "string") {
    return await User.findOne({ email: email.toLowerCase().trim() });
  }

  return null;
};

// ✅ GET /api/favorites - Get all favorites for current user
router.get("/", async (req, res) => {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return res.json({ favorites: [] });
    }

    await user.populate("favorites");
    // Filter out any deleted menu items
    const activeFavorites = (user.favorites || []).filter((item) => item !== null);

    res.json({
      favorites: activeFavorites,
      count: activeFavorites.length,
    });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites", details: err.message });
  }
});

// ✅ POST /api/favorites/toggle - Add or remove an item from user's favorites
router.post("/toggle", async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    const user = await resolveUser(req);
    if (!user) {
      return res.status(401).json({ message: "Please sign in to save your personal favorites." });
    }

    // Check if menu item exists
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const exists = user.favorites.some((favId) => favId.toString() === itemId.toString());

    if (exists) {
      user.favorites = user.favorites.filter((favId) => favId.toString() !== itemId.toString());
    } else {
      user.favorites.push(menuItem._id);
    }

    await user.save();
    await user.populate("favorites");

    res.json({
      message: exists ? "Removed from favorites" : "Added to favorites",
      isFavorite: !exists,
      favorites: user.favorites.filter((item) => item !== null),
    });
  } catch (err) {
    console.error("Error toggling favorite:", err);
    res.status(500).json({ error: "Failed to update favorites", details: err.message });
  }
});

module.exports = router;

