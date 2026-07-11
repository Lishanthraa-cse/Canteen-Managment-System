// Step-by-step process for order confirmation
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderConfirmationPage.css";

const OrderConfirmation = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [tableNumber, setTableNumber] = useState("");
  const navigate = useNavigate();

  // Load order details from localStorage when component mounts
  useEffect(() => {
    const savedOrder = localStorage.getItem("orderDetails");
    if (savedOrder) {
      setOrderDetails(JSON.parse(savedOrder));
    } else {
      navigate("/cart"); // Redirect to cart if no order is found
    }
  }, [navigate]);

  // Handle payment button click
  const handlePayment = () => {
    if (!tableNumber.trim()) {
      alert("Please enter your table or token number.");
      return;
    }

    const finalOrder = {
      ...orderDetails,
      tableNumber,
    };

    // Store final order details before moving to payment
    localStorage.setItem("finalOrder", JSON.stringify(finalOrder));
    navigate("/payment"); // Navigate to payment page
  };

  return (
    <div className="order-confirmation-container">
      <h1>📝 Order Confirmation</h1>

      {orderDetails && orderDetails.items ? (
        <div>
          <h2>📜 Bill Summary</h2>
          <table className="bill-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{Number(item.price).toFixed(2)}</td>
                  <td>₹{(Number(item.price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>💰 Grand Total: ₹{Number(orderDetails.totalAmount).toFixed(2)}</h2>

          <div className="user-details">
            <label>🍽️ Table/Token Number:</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter table/token number"
            />
          </div>

          <button className="proceed-button" onClick={handlePayment}>
            💳 Proceed to Payment
          </button>
        </div>
      ) : (
        <p>Loading order details...</p>
      )}
    </div>
  );
};

export default OrderConfirmation;
