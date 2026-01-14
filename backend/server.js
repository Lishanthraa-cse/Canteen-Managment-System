require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

// Check for JWT secret
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not defined in .env");
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Models
const User = require("./models/User");
const Admin = require("./models/Admin");
const MenuItem = require("./models/MenuItem");

// Middleware
const authenticateAdmin = require("./middleware/authenticateAdmin");

// Route Files
const NotificationsRoutes = require('./routes/Notifications');
const ScheduleOrderRoutes = require('./routes/scheduleorder');
const OrderRoutes = require('./routes/Order');
const SpecialsRoutes = require('./routes/specials');
const FeedbackRoutes = require('./routes/Feedback');
const BackupRoutes = require('./routes/backup');
const menuRoutes = require('./routes/menuRouter');
const SecurityRoutes = require('./routes/Security');
const AdminloginRoutes = require('./routes/Adminlogin');

// Use Routes
app.use("/api/notifications", NotificationsRoutes);
app.use("/api/scheduleorder", ScheduleOrderRoutes);
app.use("/api/specials", SpecialsRoutes);
app.use("/api/feedback", FeedbackRoutes);
app.use("/api/backup", BackupRoutes);
app.use("/api/order", OrderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/admin", SecurityRoutes);
app.use("/api/admin/login", AdminloginRoutes);

// User Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!email || !phone || !password)
      return res.status(400).json({ message: "All fields are required!" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, phone, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    res.status(500).json({ message: "Signup failed!", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required!" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found!" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials!" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful!", token, user });
  } catch (error) {
    res.status(500).json({ message: "Login failed!", error: error.message });
  }
});

// Menu Management Routes
app.get("/api/menu", async (req, res) => {
  try {
    const menu = await MenuItem.find();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch menu" });
  }
});

app.post("/api/menu", authenticateAdmin, async (req, res) => {
  try {
    const { name, price, image, availability, category } = req.body;
    const newItem = new MenuItem({ name, price, image, availability, category });
    await newItem.save();
    res.status(201).json({ message: "✅ Item added successfully!", item: newItem });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to add item" });
  }
});

app.put("/api/menu/:id", authenticateAdmin, async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "✅ Item updated", item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to update item" });
  }
});

app.delete("/api/menu/:id", authenticateAdmin, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "✅ Item deleted", item: deletedItem });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to delete item" });
  }
});
app.post("/api/admin/login", async (req, res) => {
  console.log("Admin login attempt:", req.body); // ✅ log
  const { email, password } = req.body;

  if (!email.endsWith("@srec.ac.in")) {
    console.log("❌ Email not allowed");
    return res.status(401).json({ message: "Unauthorized Admin Access" });
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.log("❌ Admin not found");
    return res.status(401).json({ message: "Admin not found" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    console.log("❌ Incorrect password");
    return res.status(401).json({ message: "Incorrect Password" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

  console.log("✅ Admin login success");
  res.json({ message: "Admin login successful!", token });
});


// Serve frontend for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT,'localhost', () => console.log(`🚀 Server running on port ${PORT}`));
