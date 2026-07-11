import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import logo from "../assets/collegeImage.jpg"; // Make sure this image is neat and bright!

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="background-overlay"></div>

      <div className="home-card">
        <header className="home-header">
          <img src={logo} alt="SREC Canteen" className="logo" />
          <h1>SREC CANTEEN</h1>
          <p className="tagline">Serving Happiness, One Meal at a Time 🍽️</p>
        </header>

        <main className="home-main">
          <h2 className="welcome-text">Welcome to Your Smart Canteen</h2>
          <p className="subtext">Skip the lines. Fresh, hot meals are just a tap away!</p>

          <div className="card-section">
            <div className="card user-card">
              <h3>Student Portal</h3>
              <p>Access exclusive menus, track orders, and more.</p>
              <div className="btn-group">
                <Link to="/login" className="btn primary-btn">Login</Link>
                <Link to="/signup" className="btn secondary-btn">Sign Up</Link>
              </div>
            </div>

            <div className="admin-box">
  <h3>Admin Dashboard</h3>
  <p>Manage menus, track orders, and optimize service quality.</p>
  <Link to="/adminlogin" className="admin-login-btn">Admin Login</Link>
</div>

          </div>
        </main>

        <footer className="home-footer">
          <p>© {new Date().getFullYear()} SREC Canteen • Designed with ❤️ for Students</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
