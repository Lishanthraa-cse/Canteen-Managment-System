// createAdmin.js
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Admin = require('./models/Admin');

const createAdmin = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI ||
      "mongodb+srv://harrines0920:Rw8z5e00Iwug8OfK@cluster3.n2wws.mongodb.net/cb?retryWrites=true&w=majority&appName=Cluster3";
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    const existingAdmin = await Admin.findOne({ email: 'admin@srec.ac.in' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists (admin@srec.ac.in)');
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new Admin({
      email: 'admin@srec.ac.in',
      password: hashedPassword,
    });

    await admin.save();
    console.log('✅ Admin created successfully (admin@srec.ac.in / admin123)');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();
