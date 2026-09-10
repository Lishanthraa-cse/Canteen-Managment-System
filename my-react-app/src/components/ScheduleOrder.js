import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaArrowLeft } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import "./ScheduleOrder.css";

const ScheduleOrder = () => {
  const { currentUser, setActiveOrder, showToast } = useApp();
  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState(null);
  const [customerName, setCustomerName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const email = currentUser?.email || "student@srec.ac.in";
  const [scheduleTime, setScheduleTime] = useState("12:30 PM");
  const tableNumber = "Counter Pickup";
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("scheduledItem");
      if (stored) {
        setSelectedItem(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const timeSlots = [
    "08:30 AM",
    "09:30 AM",
    "10:30 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
  ];

  const handleScheduleOrder = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      showToast("Please choose a food item from the menu first", "error");
      navigate("/menu");
      return;
    }

    if (!customerName || !phone) {
      showToast("Please enter your name and phone number", "error");
      return;
    }

    setLoading(true);
    const totalAmount = Number(selectedItem.price) * quantity;

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          email,
          phone,
          tableNumber,
          items: [{ ...selectedItem, quantity }],
          totalAmount,
          paymentStatus: "PAID",
          paymentMethod: "UPI",
          orderType: "scheduled",
          scheduleTime,
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        setActiveOrder(data.order);
        localStorage.setItem("receipt", JSON.stringify(data.order));
        localStorage.removeItem("scheduledItem");
        showToast("🎉 Order scheduled successfully! Pick it up at your chosen slot.", "success");
        navigate("/receipt");
      } else {
        showToast(data.message || "Failed to schedule order", "error");
      }
    } catch (err) {
      showToast("Network error scheduling order", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-page-root">
      <Navbar />

      <main className="schedule-container">
        <Link to="/menu" className="back-link">
          <FaArrowLeft /> Browse Menu
        </Link>

        <div className="schedule-card-wrapper">
          <div className="schedule-header">
            <div className="cal-icon-box">
              <FaCalendarAlt />
            </div>
            <h1>Schedule Your Meal</h1>
            <p>Pre-order before class and pick up steaming hot food right on time.</p>
          </div>

          <form onSubmit={handleScheduleOrder} className="schedule-form">
            {/* Selected Item Preview */}
            {selectedItem ? (
              <div className="selected-dish-pill">
                <img src={selectedItem.image} alt={selectedItem.name} />
                <div className="dish-details">
                  <h4>{selectedItem.name}</h4>
                  <span>₹{selectedItem.price} each • {selectedItem.category}</span>
                </div>
                <div className="qty-controls">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-item-selected-box">
                <p>No dish selected yet.</p>
                <Link to="/menu" className="pick-dish-link">
                  + Select a Dish from Menu
                </Link>
              </div>
            )}

            {/* Time Slot Picker */}
            <div className="form-section">
              <label className="section-label">
                <FaClock /> Select Pickup Time Slot:
              </label>
              <div className="time-slots-grid">
                {timeSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    className={`slot-chip ${scheduleTime === slot ? "active" : ""}`}
                    onClick={() => setScheduleTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Details */}
            <div className="form-grid-2">
              <div className="input-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Special Instructions (Optional)</label>
              <input
                type="text"
                placeholder="e.g. keep parcel packed in foil..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {selectedItem && (
              <div className="schedule-total-banner">
                <span>Total Amount:</span>
                <strong className="total-figure">
                  ₹{(Number(selectedItem.price) * quantity).toFixed(2)}
                </strong>
              </div>
            )}

            <button
              type="submit"
              className="confirm-schedule-btn"
              disabled={loading || !selectedItem}
            >
              {loading ? "Scheduling Order..." : `Confirm Schedule for ${scheduleTime} ➔`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ScheduleOrder;
