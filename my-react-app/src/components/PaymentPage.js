import React, { useEffect, useState, useRef, useCallback } from "react";
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
  FaMobileAlt,
  FaAt,
  FaBolt,
  FaCheck,
  FaClock,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import "./PaymentPage.css";

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", color: "#4285F4", badge: "GPay", vpaDomain: "okhdfcbank" },
  { id: "phonepe", name: "PhonePe", color: "#5f259f", badge: "PhonePe", vpaDomain: "ybl" },
  { id: "paytm", name: "Paytm", color: "#00b9f5", badge: "Paytm", vpaDomain: "paytm" },
  { id: "bhim", name: "BHIM UPI", color: "#007a3d", badge: "BHIM", vpaDomain: "upi" },
];

const PaymentPage = () => {
  const { clearCart, setActiveOrder, showToast } = useApp();
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiSubMode, setUpiSubMode] = useState("qr"); // 'qr' | 'apps' | 'vpa'
  const [selectedApp, setSelectedApp] = useState(UPI_APPS[0]);
  const [vpaInput, setVpaInput] = useState("student@okhdfcbank");
  const [processing, setProcessing] = useState(false);
  
  // Payment Simulation Modal state
  const [isSimulating, setIsSimulating] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [simulatedAppName, setSimulatedAppName] = useState("UPI");
  const timerRef = useRef(null);

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

  // Dual tone success chime using Web Audio API
  const playSuccessChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880.0, ctx.currentTime + 0.12); // A5

      osc2.frequency.setValueAtTime(880.0, ctx.currentTime);
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12); // D6

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.7);
      osc2.stop(ctx.currentTime + 0.7);
    } catch (e) {
      console.warn("Audio chime unsupported:", e);
    }
  }, []);

  const totalAmount = orderDetails ? Number(orderDetails.totalAmount || 0).toFixed(2) : "0.00";
  const upiPayload = `upi://pay?pa=canteen@srec.ac.in&pn=SREC%20Smart%20Canteen&am=${totalAmount}&cu=INR&tn=Order`;

  // Submit order to backend & complete payment
  const completeOrderWithBackend = useCallback(async (methodUsed, txnId) => {
    if (!orderDetails) return;
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
          paymentStatus: methodUsed === "Cash" ? "PENDING" : "PAID",
          paymentMethod: methodUsed,
          transactionId: txnId || `TXN-SREC-${Math.floor(100000 + Math.random() * 900000)}`,
          orderType: orderDetails.orderType || "normal",
          scheduleTime: orderDetails.scheduleTime || null,
          notes: orderDetails.notes || "",
        }),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        // Save completed receipt & active order
        const savedOrder = data.order;
        playSuccessChime();
        setActiveOrder(savedOrder);
        localStorage.setItem("receipt", JSON.stringify(savedOrder));
        clearCart();
        localStorage.removeItem("finalOrder");

        showToast("🎉 Payment confirmed! Your order token is ready.", "success");
        navigate("/receipt");
      } else {
        showToast(data.message || "Failed to place order. Please try again.", "error");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      showToast("Network error submitting order. Please check backend connection.", "error");
    } finally {
      setProcessing(false);
      setIsSimulating(false);
    }
  }, [orderDetails, playSuccessChime, setActiveOrder, clearCart, showToast, navigate]);

  // Trigger UPI App or VPA Simulation
  const triggerUpiSimulation = (appName) => {
    setSimulatedAppName(appName);
    setCountdown(15);
    setIsSimulating(true);
  };

  // Immediate approval trigger
  const handleInstantApproval = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const txnId = `TXN-UPI-${Math.floor(100000 + Math.random() * 900000)}`;
    completeOrderWithBackend(`UPI (${simulatedAppName})`, txnId);
  };

  // Timer effect for simulation
  useEffect(() => {
    if (!isSimulating) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          const txnId = `TXN-UPI-${Math.floor(100000 + Math.random() * 900000)}`;
          completeOrderWithBackend(`UPI (${simulatedAppName})`, txnId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, simulatedAppName, completeOrderWithBackend]);

  const handleConfirmPayment = () => {
    if (paymentMethod === "UPI") {
      if (upiSubMode === "apps") {
        triggerUpiSimulation(selectedApp.name);
      } else if (upiSubMode === "vpa") {
        if (!vpaInput.includes("@")) {
          showToast("Please enter a valid UPI ID (e.g. yourname@okhdfcbank)", "error");
          return;
        }
        triggerUpiSimulation(`VPA: ${vpaInput}`);
      } else {
        // QR mode
        triggerUpiSimulation("Scanned QR");
      }
    } else {
      const generatedTxn = paymentMethod === "Card" ? `TXN-CARD-${Date.now().toString().slice(-6)}` : null;
      completeOrderWithBackend(paymentMethod, generatedTxn);
    }
  };

  if (!orderDetails) {
    return null;
  }

  const isVpaValid = vpaInput.trim().length > 3 && vpaInput.includes("@");

  return (
    <div className="payment-page-root">
      <Navbar />

      <main className="payment-container">
        <button className="payment-back-link" onClick={() => navigate("/cart")}>
          <FaArrowLeft /> Back to Cart
        </button>

        <div className="payment-card-wrap">
          <div className="payment-header">
            <span className="pay-badge">Fast & Secure Checkout</span>
            <h1>Choose Payment Method</h1>
            <p>Complete your order securely using instant UPI, Card, or Pay at Counter.</p>
          </div>

          {/* Amount Showcase */}
          <div className="amount-banner">
            <span className="amount-label">Total Payable</span>
            <span className="amount-val">₹{totalAmount}</span>
            <div className="amount-meta">
              <span>👤 {orderDetails.customerName}</span>
              <span>•</span>
              <span>📍 {orderDetails.tableNumber}</span>
              <span>•</span>
              <span>🛍️ {orderDetails.items?.length || 0} Items</span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="payment-method-tabs">
            <button
              className={`pay-tab ${paymentMethod === "UPI" ? "active" : ""}`}
              onClick={() => setPaymentMethod("UPI")}
            >
              <FaQrcode /> Instant UPI
            </button>
            <button
              className={`pay-tab ${paymentMethod === "Card" ? "active" : ""}`}
              onClick={() => setPaymentMethod("Card")}
            >
              <FaCreditCard /> Campus Smart Card
            </button>
            <button
              className={`pay-tab ${paymentMethod === "Cash" ? "active" : ""}`}
              onClick={() => setPaymentMethod("Cash")}
            >
              <FaMoneyBillWave /> Pay at Counter
            </button>
          </div>

          {/* UPI Payment Flow */}
          {paymentMethod === "UPI" && (
            <div className="upi-container-box">
              {/* Sub-mode selector */}
              <div className="upi-submode-tabs">
                <button
                  className={`upi-sub-btn ${upiSubMode === "qr" ? "active" : ""}`}
                  onClick={() => setUpiSubMode("qr")}
                >
                  <FaQrcode /> QR Code
                </button>
                <button
                  className={`upi-sub-btn ${upiSubMode === "apps" ? "active" : ""}`}
                  onClick={() => setUpiSubMode("apps")}
                >
                  <FaMobileAlt /> UPI Apps
                </button>
                <button
                  className={`upi-sub-btn ${upiSubMode === "vpa" ? "active" : ""}`}
                  onClick={() => setUpiSubMode("vpa")}
                >
                  <FaAt /> UPI ID (VPA)
                </button>
              </div>

              {/* 1. Dynamic QR Code Mode */}
              {upiSubMode === "qr" && (
                <div className="upi-qr-display-box">
                  <div className="qr-frame">
                    <QRCodeSVG
                      value={upiPayload}
                      size={185}
                      level="H"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                    />
                  </div>
                  <p className="qr-caption">
                    Scan with any UPI App (<strong>GPay, PhonePe, Paytm, BHIM</strong>)
                  </p>
                  <span className="upi-vpa-pill">UPI ID: canteen@srec.ac.in</span>
                </div>
              )}

              {/* 2. 1-Click UPI Apps Selector */}
              {upiSubMode === "apps" && (
                <div className="upi-apps-selector-box">
                  <p className="upi-section-title">Select your preferred UPI app to simulate payment:</p>
                  <div className="upi-apps-grid">
                    {UPI_APPS.map((app) => (
                      <div
                        key={app.id}
                        className={`upi-app-card ${selectedApp.id === app.id ? "selected" : ""}`}
                        onClick={() => setSelectedApp(app)}
                      >
                        <div
                          className="upi-app-icon-badge"
                          style={{ backgroundColor: app.color }}
                        >
                          {app.badge}
                        </div>
                        <span className="upi-app-name">{app.name}</span>
                        {selectedApp.id === app.id && (
                          <span className="app-checked-indicator">
                            <FaCheck />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="upi-hint">
                    Selected: <strong>{selectedApp.name}</strong>. Clicking confirm will trigger the approval simulation.
                  </p>
                </div>
              )}

              {/* 3. VPA ID Entry Mode */}
              {upiSubMode === "vpa" && (
                <div className="upi-vpa-entry-box">
                  <p className="upi-section-title">Enter your UPI ID (VPA) to receive payment request:</p>
                  <div className="vpa-input-group">
                    <span className="vpa-icon">@</span>
                    <input
                      type="text"
                      className="vpa-input"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={vpaInput}
                      onChange={(e) => setVpaInput(e.target.value)}
                    />
                    {isVpaValid && <span className="vpa-valid-tick">✓ Verified</span>}
                  </div>

                  <div className="quick-vpa-pills">
                    <span className="quick-vpa-label">Quick handles:</span>
                    {["@okhdfcbank", "@okaxis", "@ybl", "@paytm"].map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        className="quick-handle-chip"
                        onClick={() => setVpaInput(`student${handle}`)}
                      >
                        student{handle}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Flow */}
          {paymentMethod === "Card" && (
            <div className="simulated-card-box">
              <div className="dummy-card-preview">
                <div className="card-chip"></div>
                <div className="card-number">•••• •••• •••• 4242</div>
                <div className="card-footer-row">
                  <span>SREC STUDENT SMART CARD</span>
                  <span>12/28</span>
                </div>
              </div>
              <p className="sim-info">Campus student contactless debit card simulation.</p>
            </div>
          )}

          {/* Cash Flow */}
          {paymentMethod === "Cash" && (
            <div className="cash-counter-box">
              <FaMoneyBillWave className="cash-icon" />
              <h3>Pay at Canteen Counter</h3>
              <p>Your order token will be generated immediately. Present this token at Counter #2 for quick meal collection.</p>
            </div>
          )}

          {/* Main Action Button */}
          <button
            className="confirm-pay-btn"
            onClick={handleConfirmPayment}
            disabled={processing || isSimulating}
          >
            {processing ? (
              <>
                <FaSpinner className="spin" /> Finalizing Order...
              </>
            ) : paymentMethod === "UPI" ? (
              <>
                <FaBolt /> Pay ₹{totalAmount} via UPI
              </>
            ) : (
              <>
                <FaCheckCircle /> Confirm & Complete Order (₹{totalAmount})
              </>
            )}
          </button>

          <div className="payment-security-footer">
            <FaShieldAlt /> SREC 256-Bit SSL Instant Payment Gateway Simulation
          </div>
        </div>
      </main>

      {/* Interactive UPI Simulation Modal */}
      {isSimulating && (
        <div className="simulation-overlay">
          <div className="simulation-modal">
            <div className="simulation-spinner-wrap">
              <div className="pulse-ring"></div>
              <FaClock className="sim-clock-icon" />
            </div>

            <h2>Waiting for UPI Approval</h2>
            <p className="sim-sub">
              Open your <strong>{simulatedAppName}</strong> app and approve the request of <strong>₹{totalAmount}</strong> for <strong>SREC Smart Canteen</strong>.
            </p>

            <div className="sim-countdown-badge">
              Auto-approving in <strong>{countdown}s</strong>
            </div>

            <div className="sim-actions-wrap">
              <button
                type="button"
                className="sim-approve-instant-btn"
                onClick={handleInstantApproval}
                disabled={processing}
              >
                {processing ? <FaSpinner className="spin" /> : <FaBolt />} ⚡ Simulate Instant Approval
              </button>

              <button
                type="button"
                className="sim-cancel-btn"
                onClick={() => setIsSimulating(false)}
                disabled={processing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;

