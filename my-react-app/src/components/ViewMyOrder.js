import React, { useEffect, useState } from "react";
import "./ViewMyOrder.css";

const ViewMyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [orderType, setOrderType] = useState("normal");

  useEffect(() => {
    fetchOrders(orderType);
  }, [orderType]);

  const fetchOrders = async (type) => {
    const endpoint =
      type === "normal"
        ? "http://localhost:5000/api/order/read-orders"
        : "http://localhost:5000/api/notifications/read-orders";

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  return (
    <div className="orders-page">
      <h2>📦 My Orders</h2>

      <div className="tab-buttons">
        <button
          className={orderType === "normal" ? "active" : ""}
          onClick={() => setOrderType("normal")}
        >
          Normal Orders
        </button>
        <button
          className={orderType === "scheduled" ? "active" : ""}
          onClick={() => setOrderType("scheduled")}
        >
          Scheduled Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <p>No {orderType} orders found.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order._id} className="order-card">
              <h3>{order.title || "Order"}</h3>
              <p><strong>Message:</strong> {order.message}</p>
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Table Number:</strong> {order.tableNumber}</p>
              {order.scheduleTime && (
                <p><strong>Scheduled For:</strong> {new Date(order.scheduleTime).toLocaleString()}</p>
              )}
              <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
              <p><strong>Status:</strong> {order.isDelivered ? "Delivered ✅" : "Pending ❌"}</p>
              {order.items?.length > 0 && (
                <>
                  <strong>Items:</strong>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item.name} - ₹{item.price}</li>
                    ))}
                  </ul>
                </>
              )}
              <small><em>Ordered on: {new Date(order.timestamp).toLocaleString()}</em></small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewMyOrder;
