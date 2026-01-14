// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Admin = require('./models/Admin');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const existingAdmin = await Admin.findOne({ email: 'admin@srec.ac.in' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new Admin({
      email: 'admin@srec.ac.in',
      password: hashedPassword
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  }
};

createAdmin();
