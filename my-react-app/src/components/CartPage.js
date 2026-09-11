import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaShoppingBag,
  FaReceipt,
  FaChair,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import "./CartPage.css";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, currentUser, showToast } = useApp();
  const navigate = useNavigate();

  const [diningMode, setDiningMode] = useState("counter"); // "dine-in" or "counter"
  const [tableNumber, setTableNumber] = useState("");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [orderNotes, setOrderNotes] = useState("");

  const taxAmount = Number((cartTotal * 0.05).toFixed(2));
  const finalPayable = Number((cartTotal + taxAmount).toFixed(2));

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      showToast("Your cart is empty! Add some delicious dishes first.", "error");
      return;
    }

    if (diningMode === "dine-in" && !tableNumber.trim()) {
      showToast("Please enter your Table Number for Dine-in service", "error");
      return;
    }

    const orderPayload = {
      customerName: currentUser?.name || "Student",
      email: currentUser?.email || "student@srec.ac.in",
      phone: phone || "Not Provided",
      tableNumber: diningMode === "dine-in" ? `Table ${tableNumber}` : "Counter Pickup",
      items: cart,
      subtotal: cartTotal,
      tax: taxAmount,
      totalAmount: finalPayable,
      notes: orderNotes,
      orderType: "normal",
    };

    localStorage.setItem("finalOrder", JSON.stringify(orderPayload));
    navigate("/Payment");
  };

  return (
    <div className="cart-page-root">
      <Navbar />

      <main className="cart-content-container">
        <div className="cart-page-header">
          <h1>Your Order Cart 🛒</h1>
          <p>Review selected dishes, specify dining preferences, and proceed to payment.</p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-card">
            <div className="empty-cart-icon">
              <FaShoppingBag />
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your tray yet.</p>
            <Link to="/menu" className="browse-menu-cta">
              Explore Today's Menu ➔
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Left Col: Cart Items */}
            <div className="cart-items-column">
              <div className="cart-table-card">
                <div className="table-header-bar">
                  <h3>Selected Dishes ({cart.length})</h3>
                  <button className="clear-all-link" onClick={clearCart}>
                    <FaTrash /> Clear Cart
                  </button>
                </div>

                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item._id} className="cart-item-row">
                      <img src={item.image} alt={item.name} className="cart-item-thumb" />

                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <span className="item-unit-price">₹{item.price} each</span>
                      </div>

                      <div className="cart-item-stepper">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <FaMinus />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <div className="cart-item-total">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </div>

                      <button
                        className="remove-item-btn"
                        onClick={() => removeFromCart(item._id)}
                        title="Remove dish"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="add-more-footer">
                  <Link to="/menu" className="add-more-btn">
                    + Add More Items from Menu
                  </Link>
                </div>
              </div>

              {/* Dining & Delivery Preferences */}
              <div className="preferences-card">
                <h3>🍽️ Dining Option</h3>
                <div className="dining-mode-tabs">
                  <button
                    className={`mode-tab ${diningMode === "counter" ? "active" : ""}`}
                    onClick={() => setDiningMode("counter")}
                  >
                    <FaShoppingBag /> Counter Pickup (Takeaway)
                  </button>
                  <button
                    className={`mode-tab ${diningMode === "dine-in" ? "active" : ""}`}
                    onClick={() => setDiningMode("dine-in")}
                  >
                    <FaChair /> Dine-In Table Service
                  </button>
                </div>

                {diningMode === "dine-in" && (
                  <div className="pref-input-group">
                    <label>Table Number:</label>
                    <input
                      type="text"
                      placeholder="e.g. 14, B-3"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                    />
                  </div>
                )}

                <div className="pref-input-group">
                  <label>Mobile Number (for SMS & Token):</label>
                  <input
                    type="tel"
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="pref-input-group">
                  <label>Cooking Instructions / Notes (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. less spicy, extra chutney..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Col: Bill Summary Card */}
            <div className="cart-summary-column">
              <div className="summary-card">
                <h3>
                  <FaReceipt /> Order Summary
                </h3>

                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Canteen Tax & Pack (5% GST)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="summary-line discount">
                  <span>Student Discount</span>
                  <span>FREE Service</span>
                </div>

                <hr className="summary-divider" />

                <div className="summary-total-line">
                  <span>Total Payable</span>
                  <span className="final-total">₹{finalPayable.toFixed(2)}</span>
                </div>

                <button
                  className="proceed-pay-btn"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment (₹{finalPayable.toFixed(2)}) <FaArrowRight />
                </button>

                <p className="summary-security-note">
                  🔒 Safe & encrypted simulated UPI payment. Digital token bill generated upon confirmation.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
