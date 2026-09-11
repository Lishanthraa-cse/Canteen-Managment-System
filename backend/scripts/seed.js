require("dotenv").config();
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MenuItem = require("../models/MenuItem");
const Admin = require("../models/Admin");
const Special = require("../models/Special");
const Feedback = require("../models/Feedback");
const Order = require("../models/Order");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://harrines0920:Rw8z5e00Iwug8OfK@cluster3.n2wws.mongodb.net/cb?retryWrites=true&w=majority&appName=Cluster3";

const sampleMenuItems = [
  // South Indian
  {
    name: "Crispy Masala Dosa",
    category: "South Indian",
    price: 55,
    isVeg: true,
    prepTime: "8-10 mins",
    rating: 4.8,
    description: "Golden crisp crepe stuffed with spiced mashed potatoes, served with coconut chutney & sambar.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Ghee Roast Dosa",
    category: "South Indian",
    price: 65,
    isVeg: true,
    prepTime: "10 mins",
    rating: 4.9,
    description: "Rich clarified butter roasted thin dosa served with three fresh chutneys.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Steamed Idli Sambar (2 Pcs)",
    category: "South Indian",
    price: 35,
    isVeg: true,
    prepTime: "5 mins",
    rating: 4.7,
    description: "Soft, fluffy steamed rice cakes immersed in aromatic lentil sambar and tempered chutney.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Crispy Medu Vada (2 Pcs)",
    category: "South Indian",
    price: 40,
    isVeg: true,
    prepTime: "5 mins",
    rating: 4.6,
    description: "Golden fried savory lentil doughnuts, crunchy outside and fluffy inside.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Ven Pongal with Ghee",
    category: "South Indian",
    price: 45,
    isVeg: true,
    prepTime: "5 mins",
    rating: 4.8,
    description: "Traditional rice and yellow lentil porridge seasoned with black pepper, cumin, ginger, and cashews.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Poori Masala (3 Pcs)",
    category: "South Indian",
    price: 50,
    isVeg: true,
    prepTime: "8 mins",
    rating: 4.7,
    description: "Fluffy puffed whole wheat breads served with mildly spiced potato masala curry.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },

  // North Indian & Meals
  {
    name: "Executive South Indian Thali",
    category: "Meals",
    price: 85,
    isVeg: true,
    prepTime: "5 mins",
    rating: 4.9,
    description: "Complete meal with Steamed Rice, Sambar, Rasam, Kootu, Poriyal, Curd, Appalam & Sweet.",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Veg Schezwan Fried Rice",
    category: "Meals",
    price: 75,
    isVeg: true,
    prepTime: "12 mins",
    rating: 4.6,
    description: "Wok-tossed basmati rice with crunchy vegetables and fiery Schezwan seasoning.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Paneer Butter Masala + 2 Parotta",
    category: "Meals",
    price: 90,
    isVeg: true,
    prepTime: "12 mins",
    rating: 4.9,
    description: "Soft cottage cheese cubes in rich creamy tomato gravy, paired with flaky layered parottas.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    availability: true,
    isSpecial: true,
    discountPrice: 80,
  },
  {
    name: "Chole Bhature Combo",
    category: "Meals",
    price: 70,
    isVeg: true,
    prepTime: "10 mins",
    rating: 4.8,
    description: "Punjabi spiced chickpeas curry served with two large fluffy golden bhaturas, onions, and pickle.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Curd Rice with Pomegranate",
    category: "Meals",
    price: 45,
    isVeg: true,
    prepTime: "5 mins",
    rating: 4.6,
    description: "Cool tempered yogurt rice with mustard seeds, curry leaves, green chilies, and sweet pomegranate seeds.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },

  // Snacks & Quick Bites
  {
    name: "Hot Punjabi Samosa (2 Pcs)",
    category: "Snacks",
    price: 25,
    isVeg: true,
    prepTime: "3 mins",
    rating: 4.7,
    description: "Flaky pastry crust stuffed with cumin spiced potatoes and green peas, served with mint chutney.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Crispy Veg Cheese Burger",
    category: "Snacks",
    price: 65,
    isVeg: true,
    prepTime: "10 mins",
    rating: 4.6,
    description: "Crunchy herb potato patty topped with melted cheese, lettuce, tomatoes, and tangy mayo.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Crispy French Fries (Peri-Peri)",
    category: "Snacks",
    price: 50,
    isVeg: true,
    prepTime: "8 mins",
    rating: 4.5,
    description: "Golden brown salted potato fries tossed in spicy peri-peri dust.",
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Grilled Veg Cheese Sandwich",
    category: "Snacks",
    price: 55,
    isVeg: true,
    prepTime: "8 mins",
    rating: 4.7,
    description: "Toasted sandwich filled with capsicum, onions, cheese, and spicy green chutney.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },

  // Beverages
  {
    name: "Kumbakonam Degree Filter Coffee",
    category: "Beverages",
    price: 20,
    isVeg: true,
    prepTime: "3 mins",
    rating: 4.9,
    description: "Authentic South Indian chicory-blend drip brew frothed with fresh cows milk in a traditional dabarah.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Special Masala Chai",
    category: "Beverages",
    price: 15,
    isVeg: true,
    prepTime: "3 mins",
    rating: 4.8,
    description: "Steaming hot strong milk tea infused with crushed cardamom, fresh ginger, and cloves.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Fresh Mint Lime Soda",
    category: "Beverages",
    price: 30,
    isVeg: true,
    prepTime: "4 mins",
    rating: 4.7,
    description: "Refreshing fizzy soda with freshly squeezed lime juice, mint leaves, and black salt.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Thick Chocolate Cold Coffee",
    category: "Beverages",
    price: 45,
    isVeg: true,
    prepTime: "5 mins",
    rating: 4.8,
    description: "Chilled blended espresso with ice cream, milk, and chocolate drizzle.",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
  {
    name: "Sweet Mango Lassi",
    category: "Beverages",
    price: 40,
    isVeg: true,
    prepTime: "4 mins",
    rating: 4.9,
    description: "Rich and creamy yogurt cooler blended with sweet Alphonso mango pulp.",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },

  // Desserts
  {
    name: "Hot Gulab Jamun (2 Pcs)",
    category: "Desserts",
    price: 30,
    isVeg: true,
    prepTime: "2 mins",
    rating: 4.9,
    description: "Warm milk-solid dumplings soaked in rose and cardamom infused sugar syrup.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    availability: true,
  },
];

const sampleSpecials = [
  {
    name: "Campus Special: Paneer Butter Masala Combo",
    description: "Served with 2 Malabar Parottas & Mint Chutney. Save ₹10 today!",
    price: 80,
    discountPrice: 90,
    category: "Meals",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    active: true,
  },
  {
    name: "Evening Snack Combo: Samosa + Filter Coffee",
    description: "2 Hot Samosas + 1 Kumbakonam Degree Filter Coffee.",
    price: 35,
    discountPrice: 45,
    category: "Snacks",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    active: true,
  },
  {
    name: "Cooler Deal: Mango Lassi & French Fries",
    description: "Beat the afternoon heat with delicious chilled lassi and crispy fries.",
    price: 75,
    discountPrice: 90,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80",
    active: true,
  },
];

const sampleFeedbacks = [
  {
    email: "priya.22cse@srec.ac.in",
    customerName: "Priya R.",
    rating: 5,
    feedback: "The Masala Dosa was super crispy and the filter coffee is the best on campus! Online ordering saved me 15 minutes of queue time.",
  },
  {
    email: "karthik.23mech@srec.ac.in",
    customerName: "Karthik S.",
    rating: 5,
    feedback: "Loved the UPI QR payment and instant token generation. Food was ready right when I reached the counter!",
  },
  {
    email: "ananya.21it@srec.ac.in",
    customerName: "Ananya M.",
    rating: 4,
    feedback: "The AI assistant gave great budget recommendations for lunch under ₹60. Highly recommend the Schezwan rice.",
  },
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Seed or Verify Admin
    const adminEmail = "admin@srec.ac.in";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await Admin.create({
        email: adminEmail,
        password: hashedPassword,
        name: "SREC Canteen Admin",
        role: "admin",
      });
      console.log("✅ Default Admin created: admin@srec.ac.in / admin123");
    } else {
      console.log("ℹ️ Default Admin already exists");
    }

    // 2. Seed Menu Items
    const menuCount = await MenuItem.countDocuments();
    if (menuCount < 15) {
      await MenuItem.deleteMany({});
      await MenuItem.insertMany(sampleMenuItems);
      console.log(`✅ Seeded ${sampleMenuItems.length} rich menu items across categories`);
    } else {
      console.log(`ℹ️ Database already has ${menuCount} menu items`);
    }

    // 3. Seed Specials
    const specialCount = await Special.countDocuments();
    if (specialCount === 0) {
      await Special.insertMany(sampleSpecials);
      console.log(`✅ Seeded ${sampleSpecials.length} active specials`);
    }

    // 4. Seed Feedback
    const fbCount = await Feedback.countDocuments();
    if (fbCount === 0) {
      await Feedback.insertMany(sampleFeedbacks);
      console.log(`✅ Seeded ${sampleFeedbacks.length} sample reviews`);
    }

    // 5. Seed a sample order if none exist
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.create({
        orderNumber: "ORD-9012",
        customerName: "Priya R.",
        email: "priya.22cse@srec.ac.in",
        phone: "9876543210",
        tableNumber: "Counter 1",
        items: [
          { name: "Crispy Masala Dosa", price: 55, quantity: 1 },
          { name: "Kumbakonam Degree Filter Coffee", price: 20, quantity: 1 },
        ],
        totalAmount: 75,
        paymentStatus: "PAID",
        paymentMethod: "UPI",
        status: "Completed",
        orderType: "normal",
      });
      console.log("✅ Seeded sample completed order for demonstration");
    }

    console.log("🎉 Database seeding complete! Ready for demonstration.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedDatabase();

