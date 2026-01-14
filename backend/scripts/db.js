const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://harrines0920:Rw8z5e00Iwug8OfK@cluster3.n2wws.mongodb.net/cb?retryWrites=true&w=majority&appName=Cluster3";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
