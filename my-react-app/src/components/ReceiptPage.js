import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaPrint,
  FaUtensils,
} from "react-icons/fa";
import Navbar from "./Navbar";
import "./ReceiptPage.css";

const ReceiptPage = () => {
  const [receipt, setReceipt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("receipt");
    if (!stored) {
      navigate("/menu");
      return;
    }
    try {
      setReceipt(JSON.parse(stored));
    } catch {
      navigate("/menu");
    }
  }, [navigate]);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receipt.createdAt
    ? new Date(receipt.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString();

  return (
    <div className="receipt-page-root">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="receipt-container">
        {/* Success Banner */}
        <div className="receipt-success-banner no-print">
          <FaCheckCircle className="success-banner-icon" />
          <div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order token has been transmitted directly to the canteen kitchen.</p>
          </div>
        </div>

        {/* The Printable Invoice / Bill Paper Card */}
        <div className="invoice-paper" id="printable-receipt">
          {/* Header */}
          <div className="invoice-header">
            <div className="invoice-brand">
              <FaUtensils className="brand-fork" />
              <div>
                <h2>SREC SMART CANTEEN</h2>
                <p>Sri Ramakrishna Engineering College, Coimbatore</p>
                <span>FSSAI License: 12421008000192 • GSTIN: 33AAAAA0000A1Z5</span>
              </div>
            </div>

            <div className="invoice-token-box">
              <span className="token-label">TOKEN / ORDER #</span>
              <span className="token-number">{receipt.orderNumber || "ORD-001"}</span>
              <span className="payment-stamp">PAID • {receipt.paymentMethod || "UPI"}</span>
            </div>
          </div>

          <hr className="invoice-divider" />

          {/* Metadata Grid */}
          <div className="invoice-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Customer Name:</span>
              <strong className="meta-val">{receipt.customerName || "Student"}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">Order Date & Time:</span>
              <strong className="meta-val">{formattedDate}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">Delivery / Dining:</span>
              <strong className="meta-val">{receipt.tableNumber || "Counter Pickup"}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">Phone / Contact:</span>
              <strong className="meta-val">{receipt.phone || "Not Provided"}</strong>
            </div>
          </div>

          <hr className="invoice-divider" />

          {/* Itemized Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Dish Description</th>
                <th style={{ textAlign: "center", width: "70px" }}>Qty</th>
                <th style={{ textAlign: "right", width: "100px" }}>Rate (₹)</th>
                <th style={{ textAlign: "right", width: "110px" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right" }}>₹{Number(item.price).toFixed(2)}</td>
                  <td style={{ textAlign: "right" }}>
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="invoice-divider" />

          {/* Bill Totals */}
          <div className="invoice-totals-box">
            <div className="totals-row">
              <span>Subtotal:</span>
              <span>
                ₹
                {(
                  Number(receipt.totalAmount) -
                  Number(receipt.totalAmount) * 0.05
                ).toFixed(2)}
              </span>
            </div>
            <div className="totals-row">
              <span>GST & Packaging (5%):</span>
              <span>₹{(Number(receipt.totalAmount) * 0.05).toFixed(2)}</span>
            </div>
            <div className="totals-row grand-total">
              <span>Grand Total Paid:</span>
              <span>₹{Number(receipt.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="invoice-footer">
            <p className="thank-you-msg">Thank you for dining at SREC Canteen! 🍽️</p>
            <p className="footer-sub">
              Please present your Token <strong>{receipt.orderNumber}</strong> at the counter window when your order is called.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="receipt-actions-row no-print">
          <button className="print-receipt-btn" onClick={handlePrint}>
            <FaPrint /> Print Receipt / Save PDF
          </button>
          <Link to="/viewmyorder" className="track-order-btn">
            Track Live Order Status ➔
          </Link>
          <Link to="/menu" className="return-menu-btn">
            Back to Menu
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ReceiptPage;
