require("dotenv").config();
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Check for JWT secret
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "srec_canteen_super_secure_jwt_secret_2026";
  console.log("⚠️ JWT_SECRET not provided in .env, using fallback secret.");
}

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*", // allow all client origins during development / demo
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Attach Socket.IO to req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

// MongoDB Connection
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://harrines0920:Rw8z5e00Iwug8OfK@cluster3.n2wws.mongodb.net/cb?retryWrites=true&w=majority&appName=Cluster3";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Models
const User = require("./models/User");
const Admin = require("./models/Admin");

// Route Handlers
const menuRoutes = require("./routes/menuRouter");
const orderRoutes = require("./routes/Order");
const scheduleOrderRoutes = require("./routes/scheduleorder");
const specialsRoutes = require("./routes/specials");
const notificationsRoutes = require("./routes/Notifications");
const feedbackRoutes = require("./routes/Feedback");
const adminRoutes = require("./routes/Adminlogin");
const securityRoutes = require("./routes/Security");
const chatbotRoutes = require("./routes/chatbot");
const backupRoutes = require("./routes/backup");

// API Endpoints
app.use("/api/menu", menuRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/scheduleorder", scheduleOrderRoutes);
app.use("/api/specials", specialsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/backup", backupRoutes);

// Direct Chatbot root POST fallback (for backwards compatibility)
app.post("/", (req, res, next) => {
  chatbotRoutes.handle(req, res, next);
});

// User Authentication Routes
app.post("/api/register", async (req, res) => {
  try {
    const { email, phone, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required!" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email.toLowerCase().trim(),
      phone: phone || "Not Provided",
      password: hashedPassword,
      name: name || email.split("@")[0],
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Signup successful!",
      token,
      user: { id: newUser._id, email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed!", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required!" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or user not found!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password credentials!" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful!",
      token,
      user: { id: user._id, email: user.email, name: user.name, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed!", error: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SREC Smart Canteen Management API",
    version: "2.0.0",
    time: new Date().toISOString(),
  });
});

// Socket.IO Real-Time Connection Handling
io.on("connection", (socket) => {
  console.log(`🔌 Socket Client Connected: ${socket.id}`);

  socket.on("joinAdminRoom", () => {
    socket.join("adminRoom");
    console.log(`👨‍💼 Socket ${socket.id} joined adminRoom`);
  });

  socket.on("joinUserRoom", (email) => {
    if (email) {
      socket.join(email);
      console.log(`👨‍🎓 Socket ${socket.id} joined user room: ${email}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket Client Disconnected: ${socket.id}`);
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../my-react-app/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../my-react-app/build", "index.html"));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 SREC Canteen Server running on port ${PORT}`));
