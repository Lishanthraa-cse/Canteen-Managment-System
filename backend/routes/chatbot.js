const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");
const Special = require("../models/Special");

// Catalog fallback in case DB is warming up or empty
const defaultCatalog = [
  { _id: "cat_1", name: "Masala Dosa", price: 50, category: "South Indian", isVeg: true, prepTime: "8-10 mins", calories: 320, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", description: "Crispy fermented crepe filled with spiced potato masala" },
  { _id: "cat_2", name: "Idli Vada Combo", price: 40, category: "South Indian", isVeg: true, prepTime: "3-5 mins", calories: 280, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60", description: "2 Steamed fluffy idlis + 1 crispy medu vada with sambar & chutney" },
  { _id: "cat_3", name: "Pongal", price: 45, category: "South Indian", isVeg: true, prepTime: "4-5 mins", calories: 350, image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60", description: "Ghee-rich rice & moong dal tempered with cumin, pepper & cashews" },
  { _id: "cat_4", name: "South Indian Thali", price: 80, category: "Meals", isVeg: true, prepTime: "10-12 mins", calories: 580, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=60", description: "Complete meal with rice, sambar, rasam, kootu, poriyal, curd & appalam" },
  { _id: "cat_5", name: "Veg Fried Rice", price: 75, category: "Chinese", isVeg: true, prepTime: "10-12 mins", calories: 450, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60", description: "Wok-tossed basmati rice with crunchy garden vegetables" },
  { _id: "cat_6", name: "Samosa (2 pcs)", price: 25, category: "Snacks", isVeg: true, prepTime: "2-3 mins", calories: 180, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60", description: "Golden fried pastry stuffed with spiced potatoes & peas" },
  { _id: "cat_7", name: "Filter Coffee", price: 20, category: "Beverages", isVeg: true, prepTime: "2-3 mins", calories: 75, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60", description: "Authentic Kumbakonam degree filter coffee with rich froth" },
  { _id: "cat_8", name: "Masala Chai", price: 15, category: "Beverages", isVeg: true, prepTime: "2-3 mins", calories: 60, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60", description: "Brewed tea infused with ginger, cardamom, and fresh spices" },
  { _id: "cat_9", name: "Fresh Lime Soda", price: 30, category: "Beverages", isVeg: true, prepTime: "2-3 mins", calories: 45, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60", description: "Chilled sparkling soda with fresh squeezed lemon and mint" },
  { _id: "cat_10", name: "Chicken Biryani", price: 140, category: "Non-Veg", isVeg: false, prepTime: "12-15 mins", calories: 650, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60", description: "Fragrant basmati rice slow-cooked with tender chicken and aromatic spices" },
  { _id: "cat_11", name: "Egg Puffs", price: 25, category: "Snacks", isVeg: false, prepTime: "2-3 mins", calories: 210, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60", description: "Flaky puff pastry stuffed with spiced boiled egg" },
  { _id: "cat_12", name: "Ghee Roast Dosa", price: 65, category: "South Indian", isVeg: true, prepTime: "8-10 mins", calories: 360, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", description: "Golden paper-thin crispy dosa roasted in pure desi ghee" },
];

const nutritionMap = {
  "masala dosa": { calories: 320, protein: "6g", carbs: "48g", fat: "12g", healthScore: "Balanced", tip: "Fermented lentil batter promotes gut health. Good sustained morning energy." },
  "idli": { calories: 140, protein: "4g", carbs: "28g", fat: "1g", healthScore: "Super Clean", tip: "Steamed, virtually zero-fat, easiest to digest before exams!" },
  "idli vada": { calories: 280, protein: "7g", carbs: "38g", fat: "11g", healthScore: "High Energy", tip: "Balanced combo of steamed idlis and crispy protein-rich medu vada." },
  "pongal": { calories: 350, protein: "8g", carbs: "45g", fat: "15g", healthScore: "Warm Fuel", tip: "Rich in moong dal protein, cumin and black pepper immunity boosters." },
  "south indian thali": { calories: 580, protein: "14g", carbs: "82g", fat: "18g", healthScore: "Complete Meal", tip: "Offers full micro and macro nutrients across 7 traditional dishes." },
  "veg fried rice": { calories: 450, protein: "7g", carbs: "65g", fat: "16g", healthScore: "Carb Loaded", tip: "Ideal high-energy fuel before sports or extended laboratory sessions." },
  "chicken biryani": { calories: 650, protein: "32g", carbs: "68g", fat: "24g", healthScore: "High Protein", tip: "Packed with 32g of lean chicken protein and complex basmati rice carbs." },
  "filter coffee": { calories: 75, protein: "2g", carbs: "8g", fat: "3g", healthScore: "Antioxidant Rich", tip: "Pure milk and chicory blend gives natural caffeine clarity." },
  "fresh lime soda": { calories: 45, protein: "0g", carbs: "11g", fat: "0g", healthScore: "Low Calorie", tip: "Rich in Vitamin C, instant rehydration." },
  "samosa": { calories: 180, protein: "3g", carbs: "22g", fat: "9g", healthScore: "Crispy Comfort", tip: "Spiced potato pastry, best paired with ginger masala tea." },
};

function getKitchenRushInfo() {
  const now = new Date();
  // IST is UTC + 5 hours 30 mins
  const istMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + 330;
  const istHour = Math.floor((istMinutes / 60) % 24);

  if (istHour >= 8 && istHour < 10) {
    return {
      level: "High",
      status: "Breakfast Rush 🍳",
      waitTime: "10 - 15 mins",
      crowdPercentage: 82,
      tip: "Idli & Pongal have the quickest pickup right now!",
    };
  } else if (istHour >= 10 && istHour < 12) {
    return {
      level: "Low",
      status: "Mid-Morning Chill ☕",
      waitTime: "3 - 5 mins",
      crowdPercentage: 25,
      tip: "Great time to grab tea, coffee, and fresh snacks with zero queue!",
    };
  } else if (istHour >= 12 && istHour < 14) {
    return {
      level: "Peak",
      status: "Lunch Hour Rush 🍛",
      waitTime: "15 - 20 mins",
      crowdPercentage: 94,
      tip: "High campus rush! South Indian Thali counter moves fastest.",
    };
  } else if (istHour >= 14 && istHour < 16) {
    return {
      level: "Low",
      status: "Post-Lunch Lull 😌",
      waitTime: "4 - 6 mins",
      crowdPercentage: 30,
      tip: "Short lines across all counters.",
    };
  } else if (istHour >= 16 && istHour < 18) {
    return {
      level: "Moderate",
      status: "Evening Tea & Snacks Rush 🫖",
      waitTime: "6 - 10 mins",
      crowdPercentage: 68,
      tip: "Fresh samosas, egg puffs, and degree filter coffee are hot right now!",
    };
  } else {
    return {
      level: "Low",
      status: "Off-Peak Service 🌙",
      waitTime: "3 - 5 mins",
      crowdPercentage: 20,
      tip: "Fast preparation and instant counter pickup.",
    };
  }
}

function buildSmartCombo(menuItems, budget = 100, isVegOnly = false) {
  let mains = menuItems.filter((i) => ["South Indian", "Meals", "Chinese", "Non-Veg"].includes(i.category));
  let sides = menuItems.filter((i) => ["Beverages", "Snacks"].includes(i.category));

  if (isVegOnly) {
    mains = mains.filter((i) => i.isVeg);
    sides = sides.filter((i) => i.isVeg);
  }

  let bestCombo = null;
  for (const m of mains) {
    for (const s of sides) {
      const sum = m.price + s.price;
      if (sum <= budget) {
        if (!bestCombo || sum > (bestCombo.main.price + bestCombo.side.price)) {
          bestCombo = { main: m, side: s, total: sum };
        }
      }
    }
  }

  if (!bestCombo) {
    const sortedMains = [...mains].sort((a, b) => a.price - b.price);
    const sortedSides = [...sides].sort((a, b) => a.price - b.price);
    const m = sortedMains[0] || menuItems[0];
    const s = sortedSides[0] || menuItems[1];
    bestCombo = { main: m, side: s, total: m.price + s.price };
  }

  return {
    name: `${bestCombo.main.name} + ${bestCombo.side.name}`,
    items: [bestCombo.main, bestCombo.side],
    totalPrice: bestCombo.total,
    originalPrice: bestCombo.total + 10,
    savings: 10,
  };
}

// ✅ Intelligent Canteen Concierge Engine
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ response: "Hello! How can I assist you with the canteen menu today?" });
    }

    const query = message.trim().toLowerCase();

    let menuItems = [];
    let specials = [];
    try {
      [menuItems, specials] = await Promise.all([
        MenuItem.find({ availability: true }).lean(),
        Special.find({ active: true }).lean(),
      ]);
    } catch (dbErr) {
      console.warn("Chatbot DB lookup fallback to catalog:", dbErr.message);
    }

    if (!menuItems || menuItems.length === 0) {
      menuItems = defaultCatalog;
    }

    // 1. LIVE KITCHEN RUSH & WAIT TIME FEATURE
    if (query.includes("rush") || query.includes("wait") || query.includes("crowd") || query.includes("queue") || query.includes("busy") || query.includes("how long")) {
      const rush = getKitchenRushInfo();
      const reply = `⏱️ **Live Kitchen Rush Status: ${rush.status}**\n• Current Estimated Wait: **${rush.waitTime}**\n• Kitchen Load: **${rush.crowdPercentage}%**\n💡 *Pro-Tip: ${rush.tip}*`;
      return res.json({
        response: reply,
        rushInfo: rush,
        suggestions: ["What's under ₹50?", "Build Combo", "Today's Specials"],
      });
    }

    // 2. SMART COMBO BUILDER & BUDGET MAXIMIZER FEATURE
    if (query.includes("combo") || query.includes("meal for") || query.includes("bundle") || query.includes("set") || query.includes("deal")) {
      const budgetMatch = query.match(/(\d+)/);
      const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : 80;
      const isVegOnly = query.includes("veg") && !query.includes("non");
      const combo = buildSmartCombo(menuItems, budget, isVegOnly);

      const reply = `🍱 **Chef's Smart Combo Deal for ₹${combo.totalPrice}** (Save ₹${combo.savings}!):\n• **${combo.items[0].name}** (₹${combo.items[0].price})\n• **${combo.items[1].name}** (₹${combo.items[1].price})\n\nClick the button below to add this combo to your cart in 1 click!`;
      return res.json({
        response: reply,
        combo: combo,
        suggestions: ["Build ₹100 Combo", "Pure Veg Combos", "Surprise Me!"],
      });
    }

    // 3. CALORIES & NUTRITION ADVISOR FEATURE
    if (query.includes("calorie") || query.includes("nutrition") || query.includes("healthy") || query.includes("diet") || query.includes("protein") || query.includes("fat") || query.includes("weight")) {
      // Check if specific dish mentioned
      let foundKey = Object.keys(nutritionMap).find((k) => query.includes(k));
      if (foundKey) {
        const info = nutritionMap[foundKey];
        const reply = `🥗 **Nutrition Profile for ${foundKey.toUpperCase()}:**\n• Calories: **${info.calories} kcal**\n• Protein: **${info.protein}** | Carbs: **${info.carbs}** | Fats: **${info.fat}**\n• Health Tag: **${info.healthScore}**\n💡 *Dietary Note: ${info.tip}*`;
        return res.json({
          response: reply,
          nutrition: info,
          suggestions: ["Show Pure Veg", "Check Canteen Rush", "Build Combo"],
        });
      } else {
        const reply = `🥗 **Canteen Health & Calorie Guide:**\n• **Idli (2 pcs)**: ~140 kcal (Super clean, steamed, zero oil)\n• **Masala Dosa**: ~320 kcal (High sustained morning energy)\n• **South Indian Thali**: ~580 kcal (Balanced protein, carbs & minerals)\n• **Chicken Biryani**: ~650 kcal (High protein - 32g protein)\n• **Filter Coffee**: ~75 kcal (Antioxidants + focus)\n\nAsk about any specific dish like "Calories in Dosa"!`;
        return res.json({
          response: reply,
          suggestions: ["Calories in Dosa", "Calories in Thali", "Calories in Biryani"],
        });
      }
    }

    // 4. SURPRISE ME / FOOD ROULETTE FEATURE 🎲
    if (query.includes("surprise") || query.includes("random") || query.includes("pick for me") || query.includes("roulette") || query.includes("decide")) {
      const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const reply = `🎲 **Food Roulette Pick: ${randomItem.name}!**\n${randomItem.description || "Freshly cooked to perfection by our canteen chefs."}\n• Price: ₹${randomItem.price} | Category: ${randomItem.category} | Prep: ${randomItem.prepTime}\n\nFeeling hungry? Add it right away below!`;
      return res.json({
        response: reply,
        item: randomItem,
        suggestions: ["Spin Again! 🎲", "Build Combo", "Today's Specials"],
      });
    }

    // 5. ACTIVE ORDER STATUS SHORTCUT
    if (query.includes("track") || query.includes("my order") || query.includes("order status") || query.includes("where is")) {
      const reply = `📦 **Order Tracking Service:**\nI can track your live orders! If you placed an order, check your live status pill or visit your Orders page for token callouts and kitchen progress.\n\nWould you like to open the tracker right now?`;
      return res.json({
        response: reply,
        trackOrder: true,
        suggestions: ["Open Orders Page", "Current Kitchen Rush", "Order Something Else"],
      });
    }

    // 6. BUDGET INQUIRIES
    const budgetMatch = query.match(/(?:under|below|less than|within|in)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) ||
                        query.match(/(\d+)\s*(?:rs\.?|rupees|bucks)?\s*(?:budget|or less)/i);
    if (budgetMatch) {
      const maxBudget = parseInt(budgetMatch[1], 10);
      const affordable = menuItems.filter((i) => i.price <= maxBudget).sort((a, b) => a.price - b.price);

      if (affordable.length > 0) {
        const list = affordable
          .slice(0, 4)
          .map((i) => `• **${i.name}** (₹${i.price}) — *${i.category}*`)
          .join("\n");
        const reply = `Here are great options under ₹${maxBudget}:\n${list}\n\nTap any item below to add it directly to your cart!`;
        return res.json({
          response: reply,
          items: affordable.slice(0, 3),
          suggestions: affordable.slice(0, 3).map((i) => i.name),
        });
      } else {
        const cheapest = [...menuItems].sort((a, b) => a.price - b.price)[0];
        const reply = `Sorry, we don't have items under ₹${maxBudget}. Our most affordable item is **${cheapest?.name || "Tea"}** at ₹${cheapest?.price || 15}.`;
        return res.json({ response: reply });
      }
    }

    // 7. SPECIFIC ITEM INQUIRY
    const matchedItem = menuItems.find((item) => query.includes(item.name.toLowerCase()));
    if (matchedItem) {
      const vegStatus = matchedItem.isVeg ? "🌱 Pure Veg" : "🍗 Non-Veg";
      let reply = `**${matchedItem.name}** is available! Price: ₹${matchedItem.price}.\n(${vegStatus} • Category: ${matchedItem.category} • Prep time: ${matchedItem.prepTime || "5-10 mins"})`;
      if (matchedItem.description) {
        reply += `\n"${matchedItem.description}"`;
      }
      return res.json({
        response: reply,
        item: matchedItem,
        suggestions: ["Add to Cart", "Build Combo", "Today's Specials"],
      });
    }

    // 8. SPECIALS / OFFERS INQUIRY
    if (query.includes("special") || query.includes("offer") || query.includes("discount") || query.includes("deal")) {
      if (specials.length > 0) {
        const specList = specials.map((s) => `⭐ **${s.name}** - Special Price: ₹${s.price} (${s.description})`).join("\n");
        const reply = `⭐ **Today's Chef Specials & Deals:**\n${specList}\n\nOrder now before counter supplies run out!`;
        return res.json({
          response: reply,
          items: specials.slice(0, 2),
          suggestions: ["Build Combo", "Order Now", "Pure Veg"],
        });
      } else {
        const reply = "Today we have fresh hot specials in South Indian & Meals! Check our Specials tab for today's discount deals.";
        return res.json({ response: reply, suggestions: ["View Menu", "Build Combo"] });
      }
    }

    // 9. VEG / VEGETARIAN INQUIRY
    if (query.includes("veg") && !query.includes("non")) {
      const vegItems = menuItems.filter((i) => i.isVeg).slice(0, 4);
      const list = vegItems.map((i) => `🌱 **${i.name}** - ₹${i.price}`).join("\n");
      const reply = `🌱 **Top Pure Veg Favorites:**\n${list}\n\nPrepared in a 100% dedicated hygienic vegetarian kitchen section.`;
      return res.json({
        response: reply,
        items: vegItems,
        suggestions: ["Veg Combo Under ₹80", "Breakfast Items", "Beverages"],
      });
    }

    // 10. NON-VEG INQUIRY
    if (query.includes("non-veg") || query.includes("chicken") || query.includes("egg") || query.includes("biryani")) {
      const nonVegItems = menuItems.filter((i) => !i.isVeg);
      if (nonVegItems.length > 0) {
        const list = nonVegItems.map((i) => `🍗 **${i.name}** - ₹${i.price}`).join("\n");
        const reply = `🍗 **Non-Veg Canteen Highlights:**\n${list}`;
        return res.json({
          response: reply,
          items: nonVegItems,
          suggestions: ["Chicken Biryani", "Egg Puffs", "Check Rush"],
        });
      } else {
        const reply = "Today's kitchen is serving exclusively vegetarian delights, fresh juices, and hot snacks!";
        return res.json({ response: reply });
      }
    }

    // 11. CATEGORY INQUIRIES
    if (query.includes("breakfast") || query.includes("morning") || query.includes("tiffin")) {
      const bItems = menuItems.filter((i) => i.category.toLowerCase().includes("breakfast") || i.category.toLowerCase().includes("south")).slice(0, 3);
      const list = bItems.map((i) => `• **${i.name}** - ₹${i.price}`).join("\n");
      const reply = `🥞 **Morning Breakfast Menu:**\n${list}\n\nServed piping hot with fresh coconut chutney and spicy sambar!`;
      return res.json({
        response: reply,
        items: bItems,
        suggestions: ["Masala Dosa", "Filter Coffee", "Check Rush"],
      });
    }

    if (query.includes("lunch") || query.includes("meal") || query.includes("rice")) {
      const lItems = menuItems.filter((i) => i.category.toLowerCase().includes("meal") || i.category.toLowerCase().includes("lunch") || i.category.toLowerCase().includes("chinese")).slice(0, 3);
      const list = lItems.map((i) => `• **${i.name}** - ₹${i.price}`).join("\n");
      const reply = `🍛 **Hearty Lunch Highlights:**\n${list}\n\nLunch counter operates smoothly from 11:30 AM to 3:00 PM!`;
      return res.json({
        response: reply,
        items: lItems,
        suggestions: ["South Indian Thali", "Veg Fried Rice", "Build ₹100 Combo"],
      });
    }

    if (query.includes("drink") || query.includes("tea") || query.includes("coffee") || query.includes("juice") || query.includes("beverage")) {
      const dItems = menuItems.filter((i) => i.category.toLowerCase().includes("beverage") || i.category.toLowerCase().includes("drink")).slice(0, 3);
      const list = dItems.map((i) => `• **${i.name}** - ₹${i.price}`).join("\n");
      const reply = `☕ **Refreshing Drinks & Brews:**\n${list}`;
      return res.json({
        response: reply,
        items: dItems,
        suggestions: ["Filter Coffee", "Fresh Lime Soda", "Masala Chai"],
      });
    }

    // 12. GENERAL TIMINGS & PAYMENTS
    if (query.includes("timing") || query.includes("hours") || query.includes("open") || query.includes("close")) {
      const reply = "⏰ **SREC Canteen Timings:**\n• Mon – Sat: **7:30 AM to 7:00 PM**\n• Breakfast: 7:30 AM – 11:00 AM\n• Lunch: 11:30 AM – 3:00 PM\n• Evening Snacks & Tea: 3:30 PM – 6:30 PM";
      return res.json({ response: reply, suggestions: ["Check Rush", "Today's Specials", "What's under ₹50?"] });
    }

    if (query.includes("pay") || query.includes("qr") || query.includes("upi")) {
      const reply = "💳 **Payment Options:**\n• Instant UPI QR (Google Pay, PhonePe, Paytm)\n• Credit & Debit Cards\n• Cash at Counter\nAll orders generate an instant digital verified receipt.";
      return res.json({ response: reply, suggestions: ["View Menu", "Track Order"] });
    }

    // 13. GREETINGS & DEFAULT
    if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
      const reply = `👋 **Hello and welcome to SREC Smart Canteen AI!**\nI'm your 24/7 food assistant. You can ask me:\n• "Suggest a ₹80 lunch combo"\n• "Is there a rush right now?"\n• "Calories in Masala Dosa"\n• "Surprise me with a meal 🎲"\n• "Show pure veg items under ₹50"`;
      return res.json({
        response: reply,
        suggestions: ["🍱 Build ₹80 Combo", "⏱️ Check Rush", "🎲 Surprise Me!", "🌱 Pure Veg"],
      });
    }

    // Fallback response
    const reply = `I'm here to help you navigate the canteen like a pro! Try asking:\n• "Suggest a combo under ₹100"\n• "How busy is the kitchen?"\n• "Calories in Dosa or Coffee"\n• "Pick something random for me 🎲"`;
    res.json({
      response: reply,
      suggestions: ["🍱 Build ₹80 Combo", "⏱️ Check Kitchen Rush", "🎲 Surprise Me!", "🌱 Pure Veg Under ₹50"],
    });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ response: "I had a momentary connection hiccup. Please ask again!" });
  }
});

module.exports = router;
