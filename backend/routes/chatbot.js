const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");
const Special = require("../models/Special");

// ✅ Intelligent Canteen Concierge Engine
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ response: "Hello! How can I assist you with the canteen menu today?" });
    }

    const query = message.trim().toLowerCase();

    // Fetch live menu and specials from database
    const [menuItems, specials] = await Promise.all([
      MenuItem.find({ availability: true }),
      Special.find({ active: true }),
    ]);

    let reply = "";

    // 1. Budget inquiries: "under 50", "under 100", "below 40"
    const budgetMatch = query.match(/(?:under|below|less than|within|in)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) ||
                        query.match(/(\d+)\s*(?:rs\.?|rupees|bucks)?\s*(?:budget|or less)/i);
    if (budgetMatch) {
      const maxBudget = parseInt(budgetMatch[1], 10);
      const affordable = menuItems.filter((i) => i.price <= maxBudget).sort((a, b) => a.price - b.price);

      if (affordable.length > 0) {
        const list = affordable
          .slice(0, 5)
          .map((i) => `• ${i.name} (₹${i.price}) [${i.category}]`)
          .join("\n");
        reply = `Here are great options under ₹${maxBudget}:\n${list}\n\nWould you like to add any of these to your cart?`;
        return res.json({ response: reply, suggestions: affordable.slice(0, 3).map((i) => i.name) });
      } else {
        reply = `Sorry, we don't have items under ₹${maxBudget}. Our most affordable item is ${menuItems.sort((a, b) => a.price - b.price)[0]?.name || "Tea"} at ₹${menuItems.sort((a, b) => a.price - b.price)[0]?.price || 15}.`;
        return res.json({ response: reply });
      }
    }

    // 2. Specific item inquiry (e.g. "do you have dosa", "how much is coffee")
    const matchedItem = menuItems.find((item) => query.includes(item.name.toLowerCase()));
    if (matchedItem) {
      const vegStatus = matchedItem.isVeg ? "🌱 Pure Veg" : "🍗 Non-Veg";
      reply = `${matchedItem.name} is available! It costs ₹${matchedItem.price}. (${vegStatus}, Category: ${matchedItem.category}, Prep time: ${matchedItem.prepTime}).`;
      if (matchedItem.description) {
        reply += ` "${matchedItem.description}"`;
      }
      return res.json({
        response: reply,
        item: matchedItem,
        suggestions: ["Add to Cart", "View Menu", "Show Specials"],
      });
    }

    // 3. Specials / Offers inquiry
    if (query.includes("special") || query.includes("offer") || query.includes("discount") || query.includes("deal")) {
      if (specials.length > 0) {
        const specList = specials.map((s) => `⭐ ${s.name} - Special Price: ₹${s.price} (${s.description})`).join("\n");
        reply = `Today's Chef Specials & Deals:\n${specList}\n\nOrder now before they run out!`;
      } else {
        reply = "Today we have fresh hot specials in South Indian & Meals! Check our Specials tab for today's discount deals.";
      }
      return res.json({ response: reply, suggestions: ["View Specials", "Order Now"] });
    }

    // 4. Veg / Vegetarian inquiry
    if (query.includes("veg") && !query.includes("non")) {
      const vegItems = menuItems.filter((i) => i.isVeg).slice(0, 5);
      const list = vegItems.map((i) => `🌱 ${i.name} - ₹${i.price}`).join("\n");
      reply = `Here are popular Pure Veg items available right now:\n${list}\n\nWe maintain strict hygienic veg food preparation!`;
      return res.json({ response: reply, suggestions: ["Show Breakfast", "Show Meals"] });
    }

    // 5. Non-Veg inquiry
    if (query.includes("non-veg") || query.includes("chicken") || query.includes("egg")) {
      const nonVegItems = menuItems.filter((i) => !i.isVeg);
      if (nonVegItems.length > 0) {
        const list = nonVegItems.map((i) => `🍗 ${i.name} - ₹${i.price}`).join("\n");
        reply = `Here are our delicious Non-Veg choices:\n${list}`;
      } else {
        reply = "Today's kitchen is serving exclusively vegetarian delights, fresh juices, and snacks!";
      }
      return res.json({ response: reply });
    }

    // 6. Category inquiries: Breakfast / Lunch / Snacks / Beverages
    if (query.includes("breakfast") || query.includes("morning") || query.includes("tiffin")) {
      const bItems = menuItems.filter((i) => i.category.toLowerCase().includes("breakfast") || i.category.toLowerCase().includes("south")).slice(0, 5);
      const list = bItems.map((i) => `• ${i.name} - ₹${i.price}`).join("\n");
      reply = `Morning Breakfast Highlights:\n${list || "• Masala Dosa (₹50)\n• Idli Vada Combo (₹40)\n• Pongal (₹45)"}\n\nServed piping hot with sambar & chutney!`;
      return res.json({ response: reply, suggestions: ["Order Breakfast", "Add Tea/Coffee"] });
    }

    if (query.includes("lunch") || query.includes("meal") || query.includes("rice")) {
      const lItems = menuItems.filter((i) => i.category.toLowerCase().includes("meal") || i.category.toLowerCase().includes("lunch")).slice(0, 5);
      const list = lItems.map((i) => `• ${i.name} - ₹${i.price}`).join("\n");
      reply = `Hearty Lunch Options:\n${list || "• South Indian Thali (₹80)\n• Mini Meals (₹60)\n• Veg Fried Rice (₹75)"}\n\nAvailable from 11:30 AM to 3:00 PM!`;
      return res.json({ response: reply });
    }

    if (query.includes("drink") || query.includes("tea") || query.includes("coffee") || query.includes("juice") || query.includes("beverage")) {
      const dItems = menuItems.filter((i) => i.category.toLowerCase().includes("beverage") || i.category.toLowerCase().includes("drink")).slice(0, 5);
      const list = dItems.map((i) => `• ${i.name} - ₹${i.price}`).join("\n");
      reply = `Refreshing Beverages & Hot Drinks:\n${list || "• Filter Coffee (₹20)\n• Masala Tea (₹15)\n• Fresh Lime Soda (₹30)"}`;
      return res.json({ response: reply });
    }

    // 7. Payment, Ordering & Timing inquiries
    if (query.includes("pay") || query.includes("qr") || query.includes("upi")) {
      reply = "We support instant UPI QR payments (GPay, PhonePe, Paytm), Cards, and Cash on Counter. You get an instant digital receipt after paying!";
      return res.json({ response: reply });
    }

    if (query.includes("schedule") || query.includes("advance") || query.includes("later")) {
      reply = "Yes! You can schedule food ahead of time via the 'Schedule Order' tab. Pick your pickup time slot and skip the line entirely.";
      return res.json({ response: reply });
    }

    if (query.includes("timing") || query.includes("hours") || query.includes("open") || query.includes("close")) {
      reply = "SREC Canteen is open Monday through Saturday from 7:30 AM to 7:00 PM. Breakfast is served 7:30 - 11:00 AM, Lunch 11:30 AM - 3:00 PM, and Evening Snacks 3:30 - 6:30 PM.";
      return res.json({ response: reply });
    }

    // 8. Greetings & General Help
    if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
      reply = `Hello! Welcome to SREC Smart Canteen 🍽️\nI can help you browse today's menu, find meals within your budget (e.g. "What's under ₹60?"), find specials, or answer canteen questions!`;
      return res.json({ response: reply, suggestions: ["What's under ₹50?", "Today's Specials", "Show Pure Veg Items"] });
    }

    // Fallback response with helpful suggestions
    reply = `I can help you with today's canteen menu, prices, and orders!\nTry asking:\n• "What items are under ₹50?"\n• "Do you have Dosa or Coffee?"\n• "Show today's specials"\n• "What's good for lunch?"`;
    res.json({ response: reply, suggestions: ["What's under ₹50?", "Show Specials", "Canteen Timings"] });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ response: "I'm having a momentary hiccup. Please ask again or browse the menu directly!" });
  }
});

module.exports = router;

