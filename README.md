# 🍽️ Canteen Management System

A full-stack web application for college canteens that enables students to order food online and allows administrators to efficiently manage menu items, orders, feedback, and canteen operations.

---

# 🚀 Features

## 👨‍🎓 For Users

- 🔐 **Firebase Authentication**
  - Secure Signup/Login using Firebase Authentication.

- 📋 **Browse Menu**
  - View food items by category.
  - Check prices and availability.

- 🛒 **Cart Management**
  - Add and remove food items.
  - Persistent cart storage.

- 📅 **Scheduled Orders**
  - Place orders for specific time slots.

- 💳 **QR Payment**
  - UPI QR code payment simulation.

- 📄 **Digital Receipts**
  - Automatically generated order receipts.

- 📍 **Order Tracking**
  - Real-time order status updates.

- ⭐ **Feedback & Ratings**
  - Submit ratings and reviews after receiving orders.

- 🤖 **AI Chatbot**
  - Voice-assisted chatbot for ordering and user assistance.

---

## 👨‍💼 For Admins

- 📊 **Dashboard**
  - Centralized dashboard with order and sales metrics.

- 📝 **Menu Management**
  - Add, edit, update, and delete food items.

- 📦 **Order Management**
  - View incoming orders.
  - Update order status.

- 🎯 **Specials Management**
  - Create offers, discounts, and special menu items.

- 💬 **Feedback Monitoring**
  - View customer reviews and ratings.

- 📜 **Activity Logs**
  - Track all admin activities.

- 🔔 **Notifications**
  - Send real-time notifications to users.

- 💾 **Database Backup**
  - One-click database backup functionality.

---

# 🛠️ Tech Stack

## Frontend

- React 19
- React Router DOM
- Bootstrap 5
- Chart.js
- Socket.IO Client
- Firebase Authentication
- QRCode.react

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- Bcrypt (Password Hashing)

---

# ⚙️ Installation

## Prerequisites

- Node.js (v14 or above)
- MongoDB Atlas Account
- Firebase Account
- Python 3.8+ (Optional for AI Chatbot)

---

## Backend Setup

```bash
cd backend

npm install

# Create a .env file with the following variables
# MONGO_URI
# JWT_SECRET

node createAdmin.js

npm start
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd my-react-app

npm install

npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## AI Chatbot Setup (Optional)

```bash
cd backend

pip install flask flask-cors speech_recognition pyttsx3

python app.py
```

Chatbot runs on:

```
http://localhost:5001
```

---

# 📁 Project Structure

```text
canteen-management-system/
│
├── backend/
│   ├── server.js              # Main Express Server
│   ├── routes/                # API Routes
│   ├── middleware/            # JWT Middleware
│   ├── app.py                 # Python AI Chatbot
│   └── .env                   # Environment Variables
│
├── my-react-app/
│   ├── src/
│   │   ├── components/        # React Components
│   │   ├── firebase.js        # Firebase Configuration
│   │   ├── api.js             # API Helper Functions
│   │   └── App.js             # Main Application
│   │
│   └── package.json
│
└── README.md
```

---

# 🔐 Security Features

- ✅ Password hashing using **Bcrypt**
- ✅ JWT Authentication for Admin Login
- ✅ Firebase Authentication for Users
- ✅ CORS Protection
- ✅ Environment Variables for Sensitive Data
- ✅ Input Validation
- ✅ Secure API Authentication

---

# 🎯 Default Admin Login

| Field | Value |
|-------|--------|
| **Email** | admin@srec.ac.in |
| **Password** | admin123 |

> **Note:** Change the default credentials before deploying to production.

---

# 📝 Environment Variables

Create a `.env` file inside the **backend** folder.

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

NODE_ENV=development

PORT=5000
```

---

# 🔮 Future Improvements

- 💳 Razorpay / Stripe Payment Integration
- 🚀 Redis Caching
- 📧 Email Notifications
- ✅ Unit Testing
- ✅ Integration Testing
- 🐳 Docker Containerization
- 🔄 CI/CD Pipeline
- 📱 Progressive Web App (PWA)
- 📈 Advanced Analytics Dashboard

---

# ⚠️ Disclaimer

This project has been developed **for educational purposes only**.

The QR payment functionality is **simulated** and does **not** process real financial transactions.

---

# 👨‍💻 Developed Using

- React
- Node.js
- Express.js
- MongoDB
- Firebase Authentication
- Socket.IO
- Flask
- Speech Recognition
- Bootstrap 5

---

## ⭐ If you like this project, don't forget to give it a star!


