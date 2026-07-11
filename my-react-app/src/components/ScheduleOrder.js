import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ScheduleOrder = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState({
    customerName: "",
    phone: "",
    email: "",
    tableNumber: "",
    scheduleTime: "",
    items: [],
    totalAmount: 0,
  });

  useEffect(() => {
    const selectedItem = JSON.parse(localStorage.getItem("scheduledItem"));
    if (selectedItem) {
      setOrder((prevOrder) => ({
        ...prevOrder,
        items: [selectedItem],
        totalAmount: selectedItem.price,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  const handleSchedule = async () => {
    if (!order.customerName || !order.scheduleTime) {
      alert("Please fill in your name and schedule time.");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/scheduleorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const data = await response.json();
      alert(data.message);

      // Create notification for the admin with full order details
      await fetch("http://localhost:5000/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Scheduled Order Confirmed",
          message: `Order for ${order.customerName} scheduled at ${order.scheduleTime}.`,
          type: "success",
          isRead: false,
          customerName: order.customerName,
          phone: order.phone,
          email: order.email,
          tableNumber: order.tableNumber,
          scheduleTime: order.scheduleTime,
          items: order.items,
          totalAmount: order.totalAmount
        }),
      });

      localStorage.removeItem("scheduledItem");
      navigate("/");
    } catch (error) {
      console.error("Error scheduling order:", error);
      alert("There was an error scheduling your order. Please try again.");
    }
  };

  return (
    <div className="schedule-order p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">📅 Schedule Your Order</h1>
      <div className="mb-4 space-y-3">
        <input
          type="text"
          name="customerName"
          placeholder="Your Name"
          value={order.customerName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={order.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={order.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="tableNumber"
          placeholder="Table Number"
          value={order.tableNumber}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          name="scheduleTime"
          value={order.scheduleTime}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold">
          Selected Item: {order.items[0]?.name || "No item selected"}
        </h3>
        <p>Price: ₹{order.totalAmount}</p>
      </div>
      <button
        onClick={handleSchedule}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        ✅ Confirm Schedule
      </button>
    </div>
  );
};

export default ScheduleOrder;
