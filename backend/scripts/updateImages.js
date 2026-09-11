const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://harrines0920:Rw8z5e00Iwug8OfK@cluster3.n2wws.mongodb.net/cb?retryWrites=true&w=majority&appName=Cluster3";

const accurateImages = {
  "Crispy Masala Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
  "Ghee Roast Dosa": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
  "Steamed Idli Sambar (2 Pcs)": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
  "Crispy Medu Vada (2 Pcs)": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
  "Ven Pongal with Ghee": "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80",
  "Poori Masala (3 Pcs)": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
  "Executive South Indian Thali": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80",
  "Veg Schezwan Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
  "Paneer Butter Masala + 2 Parotta": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
  "Chole Bhature Combo": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80",
  "Curd Rice with Pomegranate": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80",
  "Hot Punjabi Samosa (2 Pcs)": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  "Crispy Veg Cheese Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
  "Crispy French Fries (Peri-Peri)": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
  "Grilled Veg Cheese Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
  "Kumbakonam Degree Filter Coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
  "Special Masala Chai": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
  "Fresh Mint Lime Soda": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
  "Thick Chocolate Cold Coffee": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
  "Sweet Mango Lassi": "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80",
  "Hot Gulab Jamun (2 Pcs)": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
};

async function updateImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB Atlas.");

    let updatedCount = 0;
    for (const [dishName, imageUrl] of Object.entries(accurateImages)) {
      const res = await MenuItem.updateOne(
        { name: new RegExp(`^${dishName}$`, "i") },
        { $set: { image: imageUrl } }
      );
      if (res.matchedCount > 0) {
        console.log(`✅ Updated image for: ${dishName}`);
        updatedCount++;
      } else {
        // Partial match
        const partial = await MenuItem.updateOne(
          { name: new RegExp(dishName.split(" ")[0], "i") },
          { $set: { image: imageUrl } }
        );
        if (partial.matchedCount > 0) {
          console.log(`✅ Partial match updated for: ${dishName}`);
          updatedCount++;
        }
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} dish images in database.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating dish images:", err);
    process.exit(1);
  }
}

updateImages();

