import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUtensils,
  FaFire,
  FaClock,
  FaStar,
  FaArrowRight,
  FaShoppingCart,
  FaHistory,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import "./UsersHomepage.css";

const UsersHomepage = () => {
  const { currentUser, addToCart, activeOrder, showToast, isDarkMode } = useApp();
  const [specials, setSpecials] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const navigate = useNavigate();

  const fetchSpecials = useCallback(async () => {
    try {
      const res = await fetch("/api/specials");
      if (res.ok) {
        const data = await res.json();
        setSpecials(data);
      }
    } catch (err) {
      console.warn("Could not fetch specials:", err);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const res = await fetch(`/api/order/my-orders?email=${encodeURIComponent(currentUser.email)}`);
      if (res.ok) {
        const orders = await res.json();
        // Extract unique items from last orders for fast 1-click reordering
        const itemsMap = new Map();
        orders.slice(0, 4).forEach((o) => {
          o.items?.forEach((it) => {
            if (!itemsMap.has(it.name)) itemsMap.set(it.name, it);
          });
        });
        setRecentItems(Array.from(itemsMap.values()).slice(0, 4));
      }
    } catch (err) {
      console.warn("Could not fetch recent orders:", err);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    fetchSpecials();
    fetchRecentOrders();
  }, [fetchSpecials, fetchRecentOrders]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      showToast("Please write a few words about your canteen experience", "error");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser?.email || "student@srec.ac.in",
          customerName: currentUser?.name || "Student",
          rating: feedbackRating,
          feedback: feedbackText.trim(),
        }),
      });

      if (res.ok) {
        showToast("🎉 Thank you! Your feedback helps us improve the canteen.", "success");
        setFeedbackText("");
        setFeedbackRating(5);
      } else {
        showToast("Could not submit feedback. Try again.", "error");
      }
    } catch (err) {
      showToast("Network error submitting feedback", "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const categories = [
    { title: "South Indian", emoji: "🥞", count: "Dosa, Idli, Vada", path: "/menu?cat=South%20Indian" },
    { title: "Meals", emoji: "🍱", count: "Thali, Rice, Combos", path: "/menu?cat=Meals" },
    { title: "Snacks", emoji: "🍟", count: "Samosa, Fries, Burger", path: "/menu?cat=Snacks" },
    { title: "Beverages", emoji: "☕", count: "Filter Coffee, Juices", path: "/menu?cat=Beverages" },
  ];

  return (
    <div className={`users-home-root ${isDarkMode ? "dark-theme" : ""}`}>
      <Navbar />

      <main className="users-home-content">
        {/* Welcome Greeting Banner */}
        <section className="welcome-banner">
          <div className="welcome-text-col">
            <span className="campus-badge">CAMPUSEATS SMART DINING</span>
            <h1>
              Welcome back, <span className="highlight-name">{currentUser?.name || "Student"}!</span> 👋
            </h1>
            <p>Craving something hot & delicious? Order now and pick up fresh from the counter with zero queue wait.</p>
            <div className="banner-actions">
              <Link to="/menu" className="banner-btn primary">
                Explore Full Menu <FaArrowRight />
              </Link>
              <Link to="/scheduleorder" className="banner-btn secondary">
                <FaClock /> Schedule Order
              </Link>
            </div>
          </div>

          <div className="banner-badge-col">
            <div className="quick-token-card">
              <FaUtensils className="token-icon" />
              <h4>Instant Food Tokens</h4>
              <p>Scan UPI QR ➔ Instant Digital Bill with token number.</p>
            </div>
          </div>
        </section>

        {/* Live Active Order Alert (if order is in progress) */}
        {activeOrder && activeOrder.status !== "Completed" && activeOrder.status !== "Cancelled" && (
          <section className="active-order-banner">
            <div className="banner-status-left">
              <span className="live-badge">LIVE TRACKER</span>
              <h3>
                Order #{activeOrder.orderNumber}: <span className="status-highlight">{activeOrder.status}</span>
              </h3>
              <p>Total: ₹{activeOrder.totalAmount} • {activeOrder.items?.length || 1} Item(s)</p>
            </div>
            <Link to="/viewmyorder" className="track-status-btn">
              Track Order Progress ➔
            </Link>
          </section>
        )}

        {/* Categories Quick Nav */}
        <section className="categories-strip-section">
          <div className="section-title-row">
            <h2>Explore Categories</h2>
            <Link to="/menu" className="view-all-link">View All Menu</Link>
          </div>

          <div className="categories-cards-grid">
            {categories.map((c, i) => (
              <div
                key={i}
                className="category-card"
                onClick={() => navigate(c.path)}
              >
                <div className="cat-emoji">{c.emoji}</div>
                <h3>{c.title}</h3>
                <p>{c.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Specials Section */}
        {specials.length > 0 && (
          <section className="specials-section">
            <div className="section-title-row">
              <div className="title-with-icon">
                <FaFire className="fire-icon" />
                <h2>Today's Chef Specials & Deals</h2>
              </div>
              <span className="limited-tag">Limited Quantity Today</span>
            </div>

            <div className="specials-grid">
              {specials.map((sp) => (
                <div key={sp._id} className="special-item-card">
                  <div className="special-img-wrap">
                    <img src={sp.image} alt={sp.name} />
                    <span className="special-chip">Special Deal</span>
                  </div>
                  <div className="special-card-body">
                    <h3>{sp.name}</h3>
                    <p className="special-desc">{sp.description}</p>
                    <div className="special-price-row">
                      <div className="price-tags">
                        <span className="special-price">₹{sp.price}</span>
                        {sp.discountPrice && (
                          <span className="original-price">₹{sp.discountPrice}</span>
                        )}
                      </div>
                      <button
                        className="add-special-btn"
                        onClick={() => addToCart(sp, 1)}
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Reorder (if student has ordered before) */}
        {recentItems.length > 0 && (
          <section className="quick-reorder-section">
            <div className="section-title-row">
              <div className="title-with-icon">
                <FaHistory className="history-icon" />
                <h2>Order Again</h2>
              </div>
              <Link to="/viewmyorder" className="view-all-link">Full Order History</Link>
            </div>

            <div className="reorder-items-grid">
              {recentItems.map((item, idx) => (
                <div key={idx} className="reorder-card">
                  <div className="reorder-info">
                    <h4>{item.name}</h4>
                    <span className="reorder-price">₹{item.price}</span>
                  </div>
                  <button
                    className="reorder-fast-btn"
                    onClick={() => addToCart(item, 1)}
                  >
                    + Add Again
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Feedback Section */}
        <section className="feedback-section">
          <div className="feedback-card">
            <div className="feedback-header">
              <FaStar className="star-highlight" />
              <h3>How was your canteen meal today?</h3>
              <p>We read every review to make food taste better and service faster.</p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="feedback-form">
              <div className="rating-select-group">
                <span>Select Rating:</span>
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star-btn ${star <= feedbackRating ? "selected" : ""}`}
                      onClick={() => setFeedbackRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Share your experience (e.g. food quality, service speed, suggestions)..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                className="feedback-textarea"
              />

              <button
                type="submit"
                disabled={submittingFeedback}
                className="submit-feedback-btn"
              >
                {submittingFeedback ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UsersHomepage;
