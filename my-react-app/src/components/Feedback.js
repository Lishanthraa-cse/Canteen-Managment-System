import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaArrowLeft, FaTrash, FaSync } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import AdminSidebar from "./AdminSidebar";
import "./Feedback.css";

const Feedback = () => {
  const { showToast, isDarkMode } = useApp();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFeedbackList((prev) => prev.filter((f) => f._id !== id));
        showToast("Review deleted", "info");
      }
    } catch (err) {
      showToast("Could not delete review", "error");
    }
  };

  const avgRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) /
          feedbackList.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className={`admin-portal-root ${isDarkMode ? "dark-theme" : ""}`}>
      <AdminSidebar />
      <div className="admin-main-viewport" style={{ padding: 0 }}>
        <div className="feedback-mgmt-root">
      <div className="feedback-top-nav">
        <Link to="/admindashboard" className="back-link">
          <FaArrowLeft /> Dashboard
        </Link>
        <h2>💬 Student Reviews & Ratings</h2>
        <button className="sync-btn" onClick={fetchFeedback}>
          <FaSync className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <main className="feedback-container">
        {/* Metric Summary Card */}
        <div className="feedback-summary-banner">
          <div className="score-col">
            <span className="big-rating-number">{avgRating}</span>
            <div className="stars-render">
              {"★".repeat(Math.round(Number(avgRating)))}
            </div>
            <p>Overall Campus Satisfaction Score</p>
          </div>

          <div className="meta-col">
            <h3>{feedbackList.length} Total Student Reviews</h3>
            <p>Feedback submitted via student portal after enjoying their canteen orders.</p>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="reviews-cards-grid">
          {feedbackList.map((fb) => (
            <div key={fb._id} className="review-card">
              <div className="review-card-top">
                <div>
                  <h4>{fb.customerName || "Student"}</h4>
                  <span className="email-tag">{fb.email}</span>
                </div>
                <div className="rating-pill">
                  <FaStar className="star-icon" /> {fb.rating} / 5
                </div>
              </div>

              <p className="review-text-content">"{fb.feedback}"</p>

              <div className="review-card-bottom">
                <span className="review-date">
                  {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Recent"}
                </span>
                <button
                  className="delete-review-btn"
                  onClick={() => handleDelete(fb._id)}
                  title="Remove review"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
