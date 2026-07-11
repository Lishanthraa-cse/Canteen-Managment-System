import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentPage.css";

const PaymentPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const finalOrder = JSON.parse(localStorage.getItem("finalOrder"));
    if (finalOrder) setOrderDetails(finalOrder);

    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  const handlePaymentDone = () => {
    if (!orderDetails) {
      alert("❌ Order details not found!");
      return;
    }

    setTimeout(() => {
      alert("✅ Payment Successful! Generating your bill...");
      localStorage.setItem(
        "receipt",
        JSON.stringify({ ...orderDetails, email: userEmail })
      );
      navigate("/receipt");
    }, 1000);
  };

  return (
    <div className="payment-container">
      <h1>💳 Scan & Pay</h1>

      {orderDetails ? (
        <>
          <h2>Total: ₹{orderDetails.totalAmount}</h2>
          <p>📧 {userEmail || "Email not found"}</p>
          <p>🍽️ Table/Token: {orderDetails.tableNumber || "N/A"}</p>

          {/* QR Code */}
          <div className="qr-container">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merchant@upi&pn=FoodApp&am=100"
              alt="Scan to Pay"
              className="qr-image"
            />
            <p className="scan-text">Scan this QR with any UPI app</p>
          </div>

          {/* Payment Done Button */}
          <button className="payment-done-button" onClick={handlePaymentDone}>
            ✅ Payment Done
          </button>

          <button className="back-button" onClick={() => navigate("/orderconfirmation")}>
            🔙 Go Back
          </button>
        </>
      ) : (
        <p>Loading order details...</p>
      )}
    </div>
  );
};

export default PaymentPage;
