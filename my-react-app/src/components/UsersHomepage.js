import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaHeart,
  FaBars,
  FaRobot,
  FaUserCircle,
  FaHistory,
} from "react-icons/fa";
import axios from "axios";
import { auth } from "../firebase.js"; // Make sure this is correctly configured
import "./Chatbotpage.js";
import "./UsersHomepage.css";

const UsersHomepage = () => {
  const [userEmail, setUserEmail] = useState("Guest");
  const [specials, setSpecials] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        localStorage.setItem("userEmail", user.email); // optional
      } else {
        setUserEmail("Guest");
        localStorage.removeItem("userEmail");
      }
    });

    fetchSpecials();
    const interval = setInterval(fetchSpecials, 5000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const fetchSpecials = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/specials");
      setSpecials(response.data);
    } catch (error) {
      console.error("Error fetching special offers:", error);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim() || !rating) {
      alert("Please select a rating and enter feedback.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/feedback", {
        email: userEmail,
        rating,
        feedback,
      });
      alert("🎉 Thank you for your valuable feedback!");
      setFeedback("");
      setRating("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="users-homepage">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">🍽️ SREC Canteen</h1>
        <ul className="nav-links">
          <li>
            <Link to="/menu"><FaBars /><span>Menu</span></Link>
          </li>
          <li>
            <Link to="/cart"><FaShoppingCart /><span>Cart</span></Link>
          </li>
          <li>
            <Link to="/favorites"><FaHeart /><span>Favorites</span></Link>
          </li>
          <li>
            <Link to="/chatbot"><FaRobot /><span>Chatbot</span></Link>
          </li>
          <li>
            <Link to="/viewmyorder"><FaHistory /><span>Orders</span></Link>
          </li>
        </ul>

        {/* Profile Dropdown */}
        <div className="profile-dropdown">
          <FaUserCircle className="profile-icon" />
          <div className="dropdown-content">
            <Link to="/settingd">⚙️ Settings</Link>
            <Link to="/help">🆘 Help</Link>
            <Link to="/logout">🚪 Logout</Link>
            <Link to="/profile">👤 Profile</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1>Welcome, {userEmail} 👋</h1>
        <p>🍕 Craving something delicious? Explore our freshly prepared meals now!</p>
        <button className="explore-menu-btn">
          <Link to="/menu">🚀 Explore Menu</Link>
        </button>
      </div>

      {/* Specials */}
      <div className="special-section">
        <h2 className="special-title">✨ Today's Specials</h2>
        {specials.length === 0 ? (
          <p className="special-empty">
            No specials available at the moment. Please check back later!
          </p>
        ) : (
          <div className="special-cards-container">
            {specials.map((item) => (
              <div className="special-card-simple" key={item._id}>
                <div className="special-card-header">
                  <h3>{item.name}</h3>
                  <span className="special-price">₹{item.price}</span>
                </div>
                <p className="special-description">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className="feedback-section-pro">
        <div className="feedback-header">
          <h2>💬 Share Your Experience</h2>
          <p className="feedback-subtext">
            Your feedback helps us serve you better.
          </p>
        </div>

        <form onSubmit={handleSubmitFeedback} className="feedback-form-pro">
          <div className="feedback-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`feedback-star ${rating >= star ? "filled" : ""}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="feedback-textarea-pro"
            rows="4"
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />

          <button type="submit" className="feedback-submit-btn">
            🚀 Submit Feedback
          </button>
        </form>
      </div>

      {/* Loyalty / Rewards */}
      <div className="rewards-section">
        <h2>🏅 Loyalty Badges</h2>
        <div className="badge">
          🥇 <strong>Canteen Explorer</strong> – Ordered 10 meals!
        </div>
      </div>
    </div>
  );
};

export default UsersHomepage;
