import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  FaQrcode,
  FaCreditCard,
  FaMoneyBillWave,
  FaCheckCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaSpinner,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import "./PaymentPage.css";

const PaymentPage = () => {
  const { clearCart, setActiveOrder, showToast } = useApp();
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("finalOrder");
    if (!saved) {
      navigate("/menu");
      return;
    }
    try {
      setOrderDetails(JSON.parse(saved));
    } catch {
      navigate("/menu");
    }
  }, [navigate]);

  if (!orderDetails) {
    return null;
  }

  const totalAmount = Number(orderDetails.totalAmount || 0).toFixed(2);
  const upiPayload = `upi://pay?pa=canteen@srec.ac.in&pn=SREC%20Smart%20Canteen&am=${totalAmount}&cu=INR&tn=Order`;

  const handleConfirmPayment = async () => {
    setProcessing(true);
    try {
      // 1. Create order on the backend API
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: orderDetails.customerName,
          email: orderDetails.email,
          phone: orderDetails.phone,
          tableNumber: orderDetails.tableNumber,
          items: orderDetails.items,
          totalAmount: Number(orderDetails.totalAmount),
          paymentStatus: paymentMethod === "Cash" ? "PENDING" : "PAID",
          paymentMethod: paymentMethod,
          orderType: orderDetails.orderType || "normal",
          scheduleTime: orderDetails.scheduleTime || null,
          notes: orderDetails.notes || "",
        }),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        // Save completed receipt & active order
        const savedOrder = data.order;
        setActiveOrder(savedOrder);
        localStorage.setItem("receipt", JSON.stringify(savedOrder));
        clearCart();
        localStorage.removeItem("finalOrder");

        showToast("✅ Payment successful! Order placed with kitchen.", "success");
        navigate("/receipt");
      } else {
        showToast(data.message || "Failed to submit order. Please try again.", "error");
      }
    } catch (err) {
      console.error("Payment error:", err);
      showToast("Network error submitting payment. Please check your connection.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-page-root">
      <Navbar />

      <main className="payment-container">
        <button className="payment-back-link" onClick={() => navigate("/cart")}>
          <FaArrowLeft /> Back to Cart
        </button>

        <div className="payment-card-wrap">
          <div className="payment-header">
            <span className="pay-badge">Instant Checkout</span>
            <h1>Scan & Pay</h1>
            <p>Scan with any UPI app or choose cash at counter.</p>
          </div>

          {/* Amount Showcase */}
          <div className="amount-banner">
            <span className="amount-label">Total Payable</span>
            <span className="amount-val">₹{totalAmount}</span>
            <div className="amount-meta">
              <span>👤 {orderDetails.customerName}</span>
              <span>•</span>
              <span>📍 {orderDetails.tableNumber}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="payment-method-tabs">
            <button
              className={`pay-tab ${paymentMethod === "UPI" ? "active" : ""}`}
              onClick={() => setPaymentMethod("UPI")}
            >
              <FaQrcode /> UPI QR Code
            </button>
            <button
              className={`pay-tab ${paymentMethod === "Card" ? "active" : ""}`}
              onClick={() => setPaymentMethod("Card")}
            >
              <FaCreditCard /> Card (Simulated)
            </button>
            <button
              className={`pay-tab ${paymentMethod === "Cash" ? "active" : ""}`}
              onClick={() => setPaymentMethod("Cash")}
            >
              <FaMoneyBillWave /> Pay at Counter
            </button>
          </div>

          {/* Method Content */}
          {paymentMethod === "UPI" && (
            <div className="upi-qr-display-box">
              <div className="qr-frame">
                <QRCodeSVG
                  value={upiPayload}
                  size={190}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
              </div>
              <p className="qr-caption">
                Scan with <strong>Google Pay</strong>, <strong>PhonePe</strong>, or <strong>Paytm</strong>
              </p>
              <span className="upi-vpa-pill">UPI ID: canteen@srec.ac.in</span>
            </div>
          )}

          {paymentMethod === "Card" && (
            <div className="simulated-card-box">
              <div className="dummy-card-preview">
                <div className="card-chip"></div>
                <div className="card-number">•••• •••• •••• 4242</div>
                <div className="card-footer-row">
                  <span>CAMPUS SMART CARD</span>
                  <span>12/28</span>
                </div>
              </div>
              <p className="sim-info">Simulated campus debit card test transaction.</p>
            </div>
          )}

          {paymentMethod === "Cash" && (
            <div className="cash-counter-box">
              <FaMoneyBillWave className="cash-icon" />
              <h3>Pay at Counter</h3>
              <p>Your order token will be printed. Hand over cash at counter window #2 for pickup.</p>
            </div>
          )}

          {/* Confirm Payment CTA */}
          <button
            className="confirm-pay-btn"
            onClick={handleConfirmPayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <FaSpinner className="spin" /> Processing Order...
              </>
            ) : (
              <>
                <FaCheckCircle /> Confirm & Complete Order (₹{totalAmount})
              </>
            )}
          </button>

          <div className="payment-security-footer">
            <FaShieldAlt /> SREC 256-Bit SSL Campus Payment Gateway Simulation
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;
