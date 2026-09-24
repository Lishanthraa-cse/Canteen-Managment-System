import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.endsWith("@srec.ac.in")) {
      setMessage("❌ Please enter a valid @srec.ac.in email.");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        process.env.REACT_APP_API_URL
          ? `${process.env.REACT_APP_API_URL.replace(/\/api$/, "")}/forgot-password`
          : (window.location.hostname === "localhost" ? "http://localhost:5000/forgot-password" : "/forgot-password");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setMessage("✅ Password reset link sent! Check your email.");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Reset Your Password</h2>
      <p>Enter your registered email, and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ForgotPassword;
