import React from "react";
import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaQrcode,
  FaClock,
  FaStar,
  FaShieldAlt,
  FaRobot,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="landing-page-root">
      {/* Top Banner */}
      <div className="announcement-bar">
        <span>🎉 Welcome to SREC Smart Canteen! Enjoy zero-wait ordering with instant UPI QR receipts.</span>
      </div>

      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="brand-badge">
          <div className="logo-box">
            <FaUtensils />
          </div>
          <div className="logo-text">
            <strong>SREC CANTEEN</strong>
            <span>CAMPUS FOOD PORTAL</span>
          </div>
        </div>

        <div className="landing-nav-actions">
          <Link to="/menu" className="nav-ghost-btn">
            Browse Menu
          </Link>
          <Link to="/login" className="nav-login-btn">
            Student Login
          </Link>
          <Link to="/adminlogin" className="nav-admin-btn">
            <FaShieldAlt /> Admin Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pill">
            <FaStar className="pill-star" /> College Smart Canteen Management System 2.0
          </div>
          <h1 className="hero-headline">
            Skip The Lines. <br />
            <span className="gradient-text">Fresh, Hot Meals</span> at Your Fingertips.
          </h1>
          <p className="hero-subtext">
            Order your favorite dosas, meals, and degree filter coffee in seconds. Pay seamlessly with UPI QR, schedule your pickup time, and get instant notifications when your food is ready.
          </p>

          <div className="hero-cta-group">
            <Link to="/menu" className="cta-primary-btn">
              Order Food Now <FaArrowRight />
            </Link>
            <Link to="/signup" className="cta-secondary-btn">
              Create Student Account
            </Link>
          </div>

          <div className="hero-trust-row">
            <span><FaCheckCircle className="trust-icon" /> Pure Veg Options</span>
            <span><FaCheckCircle className="trust-icon" /> UPI & Cash Accepted</span>
            <span><FaCheckCircle className="trust-icon" /> Real-Time Kitchen Sync</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card main-dish-card">
            <img
              src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=700&auto=format&fit=crop&q=80"
              alt="Crispy Masala Dosa"
              className="dish-hero-img"
            />
            <div className="dish-floating-badge">
              <span className="badge-tag">Chef's Top Pick</span>
              <h4>Crispy Masala Dosa</h4>
              <div className="badge-bottom">
                <span className="price">₹55</span>
                <span className="rating">⭐ 4.9 (420+ reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="stats-strip">
        <div className="stat-box">
          <h3>1500+</h3>
          <p>Daily Happy Students</p>
        </div>
        <div className="stat-box">
          <h3>&lt; 8 Mins</h3>
          <p>Average Preparation Time</p>
        </div>
        <div className="stat-box">
          <h3>100%</h3>
          <p>Queue-Free Digital Ordering</p>
        </div>
        <div className="stat-box">
          <h3>4.8 / 5</h3>
          <p>Campus Food Rating</p>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-grid-section">
        <div className="section-header text-center">
          <span className="section-label">WHY SREC CANTEEN?</span>
          <h2>Crafted For Campus Life</h2>
          <p>Designed to save your break time and deliver delicious hot food without queue fatigue.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feat-icon-box orange">
              <FaQrcode />
            </div>
            <h3>Instant UPI QR Payment</h3>
            <p>Scan with Google Pay, PhonePe, or Paytm. Generates real-time digital receipts with token numbers.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-box blue">
              <FaClock />
            </div>
            <h3>Advance Schedule Orders</h3>
            <p>Have a tight class schedule? Pre-order your food for your lunch break and pick up without delay.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-box green">
              <FaRobot />
            </div>
            <h3>AI Canteen Concierge</h3>
            <p>Ask our voice-enabled AI assistant for budget recommendations, pure veg options, or today's specials.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon-box purple">
              <FaShieldAlt />
            </div>
            <h3>Real-Time Kitchen Tracker</h3>
            <p>Track your order status step-by-step: Placed ➔ Confirmed ➔ Cooking ➔ Ready for Pickup.</p>
          </div>
        </div>
      </section>

      {/* Portals Access Section */}
      <section className="portals-section">
        <div className="portal-banner student-portal-card">
          <div className="portal-badge">Student Zone</div>
          <h3>Student Food Hub</h3>
          <p>Browse today's full menu, save favorite snacks, and check digital order history.</p>
          <div className="portal-btn-row">
            <Link to="/login" className="portal-btn primary">Login</Link>
            <Link to="/menu" className="portal-btn secondary">Explore Menu</Link>
          </div>
        </div>

        <div className="portal-banner admin-portal-card">
          <div className="portal-badge admin">Kitchen & Admin Ops</div>
          <h3>Canteen Operations</h3>
          <p>Live order Kanban queue, menu item stock management, revenue analytics, and reports.</p>
          <div className="portal-btn-row">
            <Link to="/adminlogin" className="portal-btn admin-btn">Admin Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-col brand">
            <h4>🍽️ SREC Smart Canteen</h4>
            <p>Serving happiness, one meal at a time. Built with pride for Sri Ramakrishna Engineering College.</p>
          </div>
          <div className="footer-col links">
            <h5>Quick Links</h5>
            <Link to="/menu">Today's Menu</Link>
            <Link to="/scheduleorder">Schedule Order</Link>
            <Link to="/login">Student Sign In</Link>
            <Link to="/adminlogin">Admin Portal</Link>
          </div>
          <div className="footer-col hours">
            <h5>Canteen Timings</h5>
            <p>Mon - Sat: 7:30 AM - 7:00 PM</p>
            <p>Breakfast: 7:30 - 11:00 AM</p>
            <p>Lunch: 11:30 AM - 3:00 PM</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SREC Smart Canteen Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
