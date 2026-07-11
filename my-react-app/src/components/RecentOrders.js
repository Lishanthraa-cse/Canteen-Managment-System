import React, { useEffect, useState } from "react";

const RecentOrders = ({ userId }) => {
  const [frequentOrders, setFrequentOrders] = useState([]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await fetch(`/api/user/orders/${userId}`);
        const data = await response.json();

        const itemMap = new Map();

        data.forEach(order => {
          order.items.forEach(item => {
            const itemName = item.name;
            if (itemMap.has(itemName)) {
              itemMap.set(itemName, {
                ...item,
                count: itemMap.get(itemName).count + 1,
              });
            } else {
              itemMap.set(itemName, { ...item, count: 1 });
            }
          });
        });

        // Filter for items ordered more than 2 times
        const filtered = Array.from(itemMap.values()).filter(item => item.count > 2);
        setFrequentOrders(filtered);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchUserOrders();
  }, [userId]);

  if (frequentOrders.length === 0) {
    return null; // Don't render anything if no frequent orders
  }

  return (
    <div className="recent-orders-section p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📦 Your Recent Orders</h2>
      <div className="recent-orders-list space-y-4">
        {frequentOrders.map((item, index) => (
          <div
            key={index}
            className="order-card flex justify-between items-center p-4 bg-white rounded-lg shadow-sm"
          >
            <p className="text-lg font-medium text-gray-700">
              <strong>{item.name}</strong> - ₹{item.price}
            </p>
            <button className="reorder-btn px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
              🔁 Reorder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;
