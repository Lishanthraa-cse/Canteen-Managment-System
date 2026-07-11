import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReceiptPage.css";

const ReceiptPage = () => {
  const [receipt, setReceipt] = useState(null);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const storedUserData = userEmail ? localStorage.getItem(userEmail) : null;
  const signupDataRaw = localStorage.getItem("signupData");

  useEffect(() => {
    const storedReceipt = localStorage.getItem("receipt");
    if (!storedReceipt) {
      navigate("/menu");
      return;
    }

    const parsedReceipt = JSON.parse(storedReceipt);
    let userPhone = "Not Provided";
    const orderDate = new Date().toLocaleString();

    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData.phone) userPhone = userData.phone;
      } catch (err) {
        console.error("Error parsing stored user data:", err);
      }
    }

    if (signupDataRaw) {
      try {
        const signupData = JSON.parse(signupDataRaw);
        if (Array.isArray(signupData)) {
          const matchedUser = signupData.find(user => user.email === userEmail);
          if (matchedUser && matchedUser.phone) {
            userPhone = matchedUser.phone;
          }
        } else if (signupData.phone && signupData.email === userEmail) {
          userPhone = signupData.phone;
        }
      } catch (err) {
        console.error("Error parsing signup data:", err);
      }
    }

    const completedReceipt = {
      email: userEmail || "Not Provided",
      phoneNumber: userPhone || "Not Provided",
      orderDate: orderDate,
      tableNumber: parsedReceipt.tableNumber || "N/A",
      items: parsedReceipt.items || [],
      totalAmount: parsedReceipt.totalAmount || 0,
      address: "N/A", // optional if you want to add later
      paymentStatus: "PAID",
      status: "Pending", // for admin side tracking
    };

    setReceipt(completedReceipt);

    // Save to backend
    fetch("http://localhost:5000/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(completedReceipt),
    })
      .then((response) => response.json())
      .then((data) => console.log("✅ Order saved:", data))
      .catch((error) => console.error("❌ Error saving order:", error));
  }, [navigate, userEmail, storedUserData, signupDataRaw]);

  const handlePrint = () => window.print();

  return (
    <div className="receipt-container">
      <h1>🧾 Order Receipt</h1>

      {receipt ? (
        <div className="receipt-details">
          <h2>📜 Bill Summary</h2>
          <p><strong>Order Date:</strong> {receipt.orderDate}</p>
          <p><strong>Phone:</strong> {receipt.phoneNumber}</p>
          <p><strong>Email:</strong> {receipt.email}</p>
          <p><strong>Table/Token:</strong> {receipt.tableNumber}</p>

          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{Number(item.price).toFixed(2)}</td>
                  <td>₹{(Number(item.price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>💰 Grand Total: ₹{receipt.totalAmount}</h2>
          <h3 style={{ color: "green" }}>✅ Payment Status: PAID</h3>

          <button className="print-button" onClick={handlePrint}>🖨️ Print Receipt</button>
          <button className="back-button" onClick={() => navigate("/menu")}>🔙 Back to Menu</button>
        </div>
      ) : (
        <p>Loading receipt...</p>
      )}
    </div>
  );
};

export default ReceiptPage;
