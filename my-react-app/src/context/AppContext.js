import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import socket from "../socket";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("canteen_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Favorites State
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("canteen_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User State
  // User State (JWT Session)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("canteen_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userToken, setUserToken] = useState(() => localStorage.getItem("userToken") || null);

  // Admin State
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken") || null);

  // Active Order State
  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("canteen_active_order");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Toasts State
  const [toasts, setToasts] = useState([]);

  // Toast Dispatcher
  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem("canteen_cart", JSON.stringify(cart));
    // backward compatibility
    localStorage.setItem("cartItems", JSON.stringify(cart));
  }, [cart]);

  // Sync Favorites to LocalStorage
  useEffect(() => {
    localStorage.setItem("canteen_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Sync Active Order to LocalStorage
  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem("canteen_active_order", JSON.stringify(activeOrder));
    }
  }, [activeOrder]);

  // Connect socket room when user is active
  useEffect(() => {
    if (currentUser?.email) {
      socket.emit("joinUserRoom", currentUser.email);
    }
  }, [currentUser]);

  // Listen to Real-Time Socket Events for Order Status
  useEffect(() => {
    const handleOrderUpdate = (data) => {
      if (
        (currentUser && data.email === currentUser.email) ||
        (activeOrder && (data.orderId === activeOrder._id || data.orderNumber === activeOrder.orderNumber))
      ) {
        setActiveOrder((prev) => (prev ? { ...prev, status: data.status } : null));
        showToast(`📢 Order ${data.orderNumber} is now: ${data.status}!`, "success");
      }
    };

    socket.on("orderStatusUpdated", handleOrderUpdate);
    return () => socket.off("orderStatusUpdated", handleOrderUpdate);
  }, [currentUser, activeOrder, showToast]);

  // Cart Functions
  const addToCart = (item, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        showToast(`Updated ${item.name} quantity (${existing.quantity + quantity})`, "info");
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      showToast(`Added ${item.name} to cart`, "success");
      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i._id !== itemId));
    showToast("Item removed from cart", "info");
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("canteen_cart");
    localStorage.removeItem("cartItems");
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Favorites Functions
  const toggleFavorite = (item) => {
    const exists = favorites.some((f) => f._id === item._id);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f._id !== item._id));
      showToast(`Removed ${item.name} from favorites`, "info");
    } else {
      setFavorites((prev) => [...prev, item]);
      showToast(`Added ${item.name} to favorites ❤️`, "success");
    }
  };

  const isFavorite = (itemId) => favorites.some((f) => f._id === itemId);

  // User Login Session Helper
  const setUserSession = (userData, token = null) => {
    setCurrentUser(userData);
    localStorage.setItem("canteen_user", JSON.stringify(userData));
    if (token) {
      setUserToken(token);
      localStorage.setItem("userToken", token);
    }
    if (userData?.email) {
      localStorage.setItem("userEmail", userData.email);
      socket.emit("joinUserRoom", userData.email);
    }
  };

  // User Logout
  const logout = () => {
    setCurrentUser(null);
    setUserToken(null);
    localStorage.removeItem("canteen_user");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    showToast("Logged out successfully", "info");
  };

  // Admin Login/Logout helpers
  const setAdminSession = (token) => {
    setAdminToken(token);
    localStorage.setItem("adminToken", token);
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    localStorage.removeItem("adminToken");
    showToast("Admin logged out", "info");
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        favorites,
        toggleFavorite,
        isFavorite,
        currentUser,
        setCurrentUser,
        userToken,
        setUserSession,
        logout,
        adminToken,
        setAdminSession,
        logoutAdmin,
        activeOrder,
        setActiveOrder,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
      {/* Sleek Toast Notification Container */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "380px",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              padding: "14px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#ffffff",
              backgroundColor:
                toast.type === "success"
                  ? "#10B981"
                  : toast.type === "error"
                  ? "#EF4444"
                  : "#3B82F6",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              animation: "fadeIn 0.25s ease-out",
            }}
          >
            <span>{toast.message}</span>
            <span style={{ marginLeft: "12px", opacity: 0.7, fontSize: "16px" }}>✕</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

