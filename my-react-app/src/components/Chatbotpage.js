import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaMicrophone,
  FaVolumeUp,
  FaVolumeMute,
  FaShoppingCart,
  FaClock,
  FaFire,
  FaBoxOpen,
  FaTrashAlt,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaChevronRight,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import "./Chatbotpage.css";

const Chatbotpage = () => {
  const { addToCart, showToast, activeOrder, isDarkMode, cart } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const isFullPage = location.pathname === "/chatbot";
  const [isOpen, setIsOpen] = useState(isFullPage);

  // Auto-open if navigating directly to /chatbot
  useEffect(() => {
    if (isFullPage) {
      setIsOpen(true);
    }
  }, [isFullPage]);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi! I'm your CampusEats AI Concierge.\nHow can I help you eat well today? Ask about live kitchen wait times, ₹80/₹100 combos, calories, or let me surprise you!",
      suggestions: [
        "🍱 Build ₹80 Combo",
        "⏱️ Kitchen Wait Time",
        "🎲 Surprise Me!",
        "🥗 Healthy & Low Cal",
        "🌱 Pure Veg Items",
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [addedItems, setAddedItems] = useState({});

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Text to Speech
  const speakText = useCallback(
    (text) => {
      if (!speechEnabled || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const cleanText = text
          .replace(/[*#•]/g, "")
          .replace(/₹/g, "rupees ")
          .replace(/🎲|⏱️|🍱|🥗|🌱|🍗|⭐|📦|💡/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS error:", e);
      }
    },
    [speechEnabled]
  );

  // Client-side Local Fallback Logic if Backend is Busy/Offline
  const handleClientFallback = useCallback(
    (query) => {
      const q = query.toLowerCase();

      // Rush & Wait Time
      if (q.includes("rush") || q.includes("wait") || q.includes("crowd") || q.includes("busy") || q.includes("queue")) {
        const now = new Date();
        const hour = now.getHours();
        let level = "Low";
        let status = "Normal Service ☕";
        let waitTime = "3 - 5 mins";
        let crowdPercentage = 25;
        let tip = "No waiting! Great time to grab snacks or fresh beverages.";

        if (hour >= 8 && hour < 11) {
          level = "High";
          status = "Breakfast Peak 🍳";
          waitTime = "10 - 15 mins";
          crowdPercentage = 80;
          tip = "Idli and Pongal counters have the fastest pickup!";
        } else if (hour >= 12 && hour < 15) {
          level = "Peak";
          status = "Lunch Rush 🍛";
          waitTime = "15 - 20 mins";
          crowdPercentage = 95;
          tip = "South Indian Thali moves fast. Pre-order recommended.";
        } else if (hour >= 16 && hour < 18) {
          level = "Moderate";
          status = "Evening Snacks & Tea 🫖";
          waitTime = "6 - 10 mins";
          crowdPercentage = 65;
          tip = "Hot degree filter coffee and samosas are fresh right now.";
        }

        return {
          response: `⏱️ **Live Kitchen Rush Status: ${status}**\n• Estimated Waiting Time: **${waitTime}**\n• Kitchen Capacity: **${crowdPercentage}%**\n💡 *Tip: ${tip}*`,
          rushInfo: { level, status, waitTime, crowdPercentage, tip },
          suggestions: ["🍱 Build ₹80 Combo", "🌱 Pure Veg Items", "Today's Specials"],
        };
      }

      // Smart Combo Builder
      if (q.includes("combo") || q.includes("meal for") || q.includes("bundle") || q.includes("deal")) {
        const budgetMatch = q.match(/(\d+)/);
        const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : 80;
        let main = { name: "Masala Dosa", price: 50, prepTime: "8 mins", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60", isVeg: true };
        let side = { name: "Filter Coffee", price: 20, prepTime: "3 mins", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60", isVeg: true };

        if (budget >= 100) {
          main = { name: "South Indian Thali", price: 80, prepTime: "10 mins", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=60", isVeg: true };
          side = { name: "Fresh Lime Soda", price: 30, prepTime: "2 mins", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60", isVeg: true };
        }

        const total = main.price + side.price;
        return {
          response: `🍱 **Chef's Smart Combo Deal for ₹${total}** (Save ₹10!):\n• **${main.name}** (₹${main.price})\n• **${side.name}** (₹${side.price})\n\nClick below to add both items to your cart together!`,
          combo: {
            name: `${main.name} + ${side.name}`,
            items: [main, side],
            totalPrice: total,
            originalPrice: total + 10,
            savings: 10,
          },
          suggestions: ["Build ₹100 Combo", "🎲 Surprise Me!", "Pure Veg Combos"],
        };
      }

      // Calories & Nutrition
      if (q.includes("calorie") || q.includes("nutrition") || q.includes("healthy") || q.includes("diet") || q.includes("protein")) {
        return {
          response: `🥗 **Canteen Health & Calorie Profile:**\n• **Idli (2 pcs)**: 140 kcal (Super Clean, 0g fat, steamed)\n• **Masala Dosa**: 320 kcal (High sustained energy)\n• **South Indian Thali**: 580 kcal (Balanced carbs, protein & fiber)\n• **Chicken Biryani**: 650 kcal (High protein - 32g)\n• **Filter Coffee**: 75 kcal (Antioxidants & alertness)\n\nAsk for any specific dish or pick a healthy meal below!`,
          suggestions: ["Masala Dosa", "South Indian Thali", "Pure Veg Items"],
        };
      }

      // Surprise Me / Food Roulette
      if (q.includes("surprise") || q.includes("random") || q.includes("roulette") || q.includes("pick")) {
        const catalog = [
          { name: "Crispy Ghee Roast Dosa", price: 65, prepTime: "8 mins", isVeg: true, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60" },
          { name: "South Indian Thali Special", price: 80, prepTime: "10 mins", isVeg: true, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=60" },
          { name: "Idli Vada Combo", price: 40, prepTime: "4 mins", isVeg: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60" },
          { name: "Veg Fried Rice", price: 75, prepTime: "10 mins", isVeg: true, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60" },
        ];
        const picked = catalog[Math.floor(Math.random() * catalog.length)];
        return {
          response: `🎲 **Food Roulette Pick: ${picked.name}!**\nFreshly prepared by our chefs today.\nPrice: ₹${picked.price} | Ready in: ${picked.prepTime}`,
          item: picked,
          suggestions: ["Spin Again! 🎲", "🍱 Build ₹80 Combo", "Check Wait Time"],
        };
      }

      // Order Tracking
      if (q.includes("track") || q.includes("order") || q.includes("where")) {
        return {
          response: `📦 **Live Order Tracking:**\nCheck your active token updates, cooking status, and kitchen alerts live.`,
          trackOrder: true,
          suggestions: ["Open Order Tracker", "Kitchen Wait Time", "Today's Specials"],
        };
      }

      // Pure Veg
      if (q.includes("veg")) {
        return {
          response: `🌱 **Pure Vegetarian Recommendations:**\n• **Masala Dosa** - ₹50\n• **Pongal** - ₹45\n• **South Indian Thali** - ₹80\n• **Filter Coffee** - ₹20\n\nPrepared in a 100% segregated vegetarian kitchen space.`,
          items: [
            { name: "Masala Dosa", price: 50, prepTime: "8 mins", isVeg: true, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60" },
            { name: "Pongal", price: 45, prepTime: "5 mins", isVeg: true, image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60" },
          ],
          suggestions: ["🍱 Build ₹80 Combo", "Filter Coffee", "Check Rush"],
        };
      }

      // Default
      return {
        response: `👋 I can help you find dishes under budget, check real-time kitchen rush, construct combos, or calculate calories!\nTry tapping any of the shortcuts below.`,
        suggestions: ["🍱 Build ₹80 Combo", "⏱️ Kitchen Wait Time", "🎲 Surprise Me!", "🥗 Healthy & Low Cal"],
      };
    },
    []
  );

  const sendMessage = useCallback(
    async (textToSend) => {
      const query = (textToSend || input).trim();
      if (!query) return;

      const userMessage = { from: "user", text: query };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: query }),
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const botReply = data.response || "Here is what I found for you!";

        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: botReply,
            item: data.item,
            items: data.items,
            combo: data.combo,
            rushInfo: data.rushInfo,
            nutrition: data.nutrition,
            trackOrder: data.trackOrder,
            suggestions: data.suggestions,
          },
        ]);

        speakText(botReply);
      } catch (error) {
        console.warn("Chatbot API offline, using local smart fallback engine:", error.message);
        const fallback = handleClientFallback(query);

        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: fallback.response,
            item: fallback.item,
            items: fallback.items,
            combo: fallback.combo,
            rushInfo: fallback.rushInfo,
            nutrition: fallback.nutrition,
            trackOrder: fallback.trackOrder,
            suggestions: fallback.suggestions,
          },
        ]);

        speakText(fallback.response);
      } finally {
        setLoading(false);
      }
    },
    [input, speakText, handleClientFallback]
  );

  // Initialize Web Speech API for Voice Input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        showToast("Voice input error or permission denied", "error");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [sendMessage, showToast]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      showToast("Voice input is not supported in this browser.", "info");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast("🎙️ Listening... Speak your food query!", "info");
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAddSingleItem = (item) => {
    if (!item) return;
    addToCart(item, 1);
    setAddedItems((prev) => ({ ...prev, [item.name]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.name]: false }));
    }, 2000);
  };

  const handleAddCombo = (combo) => {
    if (!combo || !combo.items) return;
    combo.items.forEach((it) => addToCart(it, 1));
    showToast(`Added combo deal: ${combo.name} to cart!`, "success");
    setAddedItems((prev) => ({ ...prev, [combo.name]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [combo.name]: false }));
    }, 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        from: "bot",
        text: "👋 Conversation refreshed! Ask me anything about today's menu, live rush, ₹80 combos, or calories.",
        suggestions: ["🍱 Build ₹80 Combo", "⏱️ Kitchen Wait Time", "🎲 Surprise Me!", "🌱 Pure Veg Items"],
      },
    ]);
    showToast("Chat conversation cleared", "info");
  };

  const quickFeatures = [
    { label: "🍱 Combo Deal", query: "Build a ₹80 combo" },
    { label: "⏱️ Wait Time", query: "What is the kitchen wait time and rush?" },
    { label: "🎲 Surprise Me!", query: "Surprise me with a random dish" },
    { label: "🥗 Low Calorie", query: "Healthy low calorie options" },
    { label: "🌱 Pure Veg", query: "Show pure veg items under ₹50" },
    { label: "⭐ Specials", query: "What are today's chef specials?" },
    { label: "📦 Track Order", query: "Where is my order?" },
  ];

  return (
    <div className={`modern-chatbot-root ${isFullPage ? "fullpage-mode" : "floating-mode"} ${isDarkMode ? "dark-theme" : ""}`}>
      {/* Floating Trigger Button (only in floating mode when closed) */}
      {!isFullPage && !isOpen && (
        <button
          className="chatbot-floating-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open Canteen AI Concierge"
        >
          <div className="btn-icon-wrapper">
            <FaRobot />
          </div>
          <span className="btn-label">AI Concierge</span>
          <span className="online-dot"></span>
        </button>
      )}

      {/* Main Chat Interface (either Fullpage layout or Floating Window) */}
      {isOpen && (
        <div className={`chatbot-main-shell ${isFullPage ? "fullpage-shell" : "floating-window"}`}>
          {/* Fullpage Sidebar / Companion Hub */}
          {isFullPage && (
            <aside className="chatbot-sidebar">
              <div className="sidebar-brand-card">
                <div className="s-logo-box">
                  <FaRobot />
                </div>
                <div>
                  <h2 className="s-title">CampusEats AI Concierge</h2>
                  <span className="s-badge">Smart Campus Assistant</span>
                </div>
              </div>

              {/* Kitchen Live Status Widget */}
              <div className="sidebar-widget rush-widget">
                <div className="widget-header">
                  <FaClock className="w-icon" />
                  <h4>Live Canteen Pulse</h4>
                </div>
                <div className="rush-meter-box">
                  <div className="rush-bar-track">
                    <div className="rush-bar-fill" style={{ width: "65%" }}></div>
                  </div>
                  <div className="rush-meta-row">
                    <span className="rush-label">Status: <strong>Open & Cooking</strong></span>
                    <span className="rush-time">~6-10 min wait</span>
                  </div>
                </div>
                <p className="rush-tip">💡 Tip: Counter moves fastest between 10:00 AM - 12:00 PM.</p>
              </div>

              {/* Active Order Card if present */}
              {activeOrder && activeOrder.status !== "Completed" && (
                <div className="sidebar-widget active-order-widget">
                  <div className="widget-header">
                    <FaBoxOpen className="w-icon orange" />
                    <h4>Active Order #{activeOrder.orderNumber || "Live"}</h4>
                  </div>
                  <p className="order-status-text">
                    Status: <span className="status-pill">{activeOrder.status}</span>
                  </p>
                  <Link to="/viewmyorder" className="widget-action-btn">
                    Track Live Token <FaArrowRight />
                  </Link>
                </div>
              )}

              {/* Quick Prompt Ideas */}
              <div className="sidebar-widget prompts-widget">
                <div className="widget-header">
                  <FaFire className="w-icon red" />
                  <h4>Popular Campus Prompts</h4>
                </div>
                <div className="sidebar-prompts-list">
                  {quickFeatures.map((feat, idx) => (
                    <button
                      key={idx}
                      className="sidebar-prompt-btn"
                      onClick={() => sendMessage(feat.query)}
                    >
                      <span>{feat.label}</span>
                      <FaChevronRight className="arrow-sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart Quick Access */}
              <div className="sidebar-widget cart-widget">
                <div className="cart-widget-row">
                  <div>
                    <h4>Your Cart</h4>
                    <span>{cart.length} item{cart.length === 1 ? "" : "s"} selected</span>
                  </div>
                  <Link to="/cart" className="view-cart-link">
                    <FaShoppingCart /> Go to Cart
                  </Link>
                </div>
              </div>
            </aside>
          )}

          {/* Chat Window / Conversation Core */}
          <div className="chatbot-chat-core">
            {/* Topbar Header */}
            <div className="chatbot-topbar">
              <div className="topbar-info">
                {isFullPage && (
                  <button className="back-nav-btn" onClick={() => navigate(-1)} title="Go Back">
                    <FaArrowLeft />
                  </button>
                )}
                <div className="bot-avatar">
                  <FaRobot />
                </div>
                <div>
                  <h3 className="bot-title">
                    Canteen AI Concierge {isFullPage && <span className="pro-tag">Terminal</span>}
                  </h3>
                  <span className="bot-status">
                    <span className="dot"></span> Online • CampusEats Food Intelligence
                  </span>
                </div>
              </div>

              <div className="topbar-actions">
                <button
                  className={`action-icon-btn ${speechEnabled ? "active-tts" : ""}`}
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  title={speechEnabled ? "Mute Voice Speech" : "Enable Voice Speech"}
                >
                  {speechEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                </button>
                <button
                  className="action-icon-btn"
                  onClick={handleClearChat}
                  title="Clear Conversation"
                >
                  <FaTrashAlt />
                </button>
                {!isFullPage && (
                  <button
                    className="action-icon-btn close-btn"
                    onClick={() => setIsOpen(false)}
                    title="Close Assistant"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Horizontal Features Pill Strip */}
            <div className="quick-features-strip">
              {quickFeatures.map((feat, idx) => (
                <button
                  key={idx}
                  className="quick-feature-pill"
                  onClick={() => sendMessage(feat.query)}
                >
                  {feat.label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="chatbot-messages-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message-bubble-row ${msg.from}`}>
                  <div className="bubble-content">
                    <p className="bubble-text">{msg.text}</p>

                    {/* RUSH METER CARD FEATURE */}
                    {msg.rushInfo && (
                      <div className="rush-card-bubble">
                        <div className="rush-card-head">
                          <FaClock className="rc-icon" />
                          <div>
                            <strong>{msg.rushInfo.status}</strong>
                            <span>Prep Time: {msg.rushInfo.waitTime}</span>
                          </div>
                          <span className={`rush-badge ${msg.rushInfo.level.toLowerCase()}`}>
                            {msg.rushInfo.level} Load
                          </span>
                        </div>
                        <div className="rush-card-bar">
                          <div
                            className="rush-card-fill"
                            style={{ width: `${msg.rushInfo.crowdPercentage}%` }}
                          ></div>
                        </div>
                        <div className="rush-card-footer">
                          <span>💡 {msg.rushInfo.tip}</span>
                        </div>
                      </div>
                    )}

                    {/* SMART COMBO DEAL CARD FEATURE */}
                    {msg.combo && (
                      <div className="combo-quick-card">
                        <div className="combo-card-badge">
                          <FaFire /> CHEF'S COMBO DEAL • SAVE ₹{msg.combo.savings}
                        </div>
                        <div className="combo-items-list">
                          {msg.combo.items.map((item, cIdx) => (
                            <div key={cIdx} className="combo-mini-item">
                              {item.image && <img src={item.image} alt={item.name} className="c-thumb" />}
                              <div className="c-info">
                                <span className="c-name">{item.name}</span>
                                <span className="c-price">₹{item.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="combo-card-action">
                          <div className="combo-total-price">
                            <span className="combo-strike">₹{msg.combo.originalPrice}</span>
                            <span className="combo-final">₹{msg.combo.totalPrice}</span>
                          </div>
                          <button
                            className={`combo-add-btn ${addedItems[msg.combo.name] ? "added" : ""}`}
                            onClick={() => handleAddCombo(msg.combo)}
                          >
                            {addedItems[msg.combo.name] ? (
                              <>
                                <FaCheck /> Added Combo!
                              </>
                            ) : (
                              <>
                                <FaShoppingCart /> Add Combo to Cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SINGLE ITEM QUICK CARD */}
                    {msg.item && (
                      <div className="item-quick-card">
                        {msg.item.image && (
                          <img src={msg.item.image} alt={msg.item.name} className="item-thumb" />
                        )}
                        <div className="item-info">
                          <div className="item-title-row">
                            <strong>{msg.item.name}</strong>
                            <span className={`veg-dot ${msg.item.isVeg ? "veg" : "non-veg"}`}></span>
                          </div>
                          <div className="item-price-row">
                            <span className="price-tag">₹{msg.item.price}</span>
                            {msg.item.prepTime && <span className="prep-tag">⏱️ {msg.item.prepTime}</span>}
                          </div>
                        </div>
                        <button
                          className={`add-cart-mini-btn ${addedItems[msg.item.name] ? "added" : ""}`}
                          onClick={() => handleAddSingleItem(msg.item)}
                        >
                          {addedItems[msg.item.name] ? (
                            <>
                              <FaCheck /> Added
                            </>
                          ) : (
                            <>
                              <FaShoppingCart /> Add
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* MULTI ITEMS LIST CARDS */}
                    {msg.items && msg.items.length > 0 && (
                      <div className="multi-items-grid">
                        {msg.items.map((it, idx) => (
                          <div key={idx} className="item-quick-card mini">
                            {it.image && <img src={it.image} alt={it.name} className="item-thumb" />}
                            <div className="item-info">
                              <strong>{it.name}</strong>
                              <span className="price-tag">₹{it.price}</span>
                            </div>
                            <button
                              className={`add-cart-mini-btn ${addedItems[it.name] ? "added" : ""}`}
                              onClick={() => handleAddSingleItem(it)}
                            >
                              {addedItems[it.name] ? <FaCheck /> : <FaShoppingCart />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ORDER TRACKING CARD */}
                    {msg.trackOrder && (
                      <div className="order-track-card">
                        <div className="ot-head">
                          <FaBoxOpen className="ot-icon" />
                          <div>
                            <strong>Active Order Status</strong>
                            <span>
                              {activeOrder
                                ? `Order #${activeOrder.orderNumber || "Recent"} is ${activeOrder.status || "In Kitchen"}`
                                : "No orders actively cooking"}
                            </span>
                          </div>
                        </div>
                        <Link to="/viewmyorder" className="ot-button">
                          Open Live Order Tracker <FaArrowRight />
                        </Link>
                      </div>
                    )}

                    {/* SUGGESTION CHIPS */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="suggestions-grid">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            className="sug-chip"
                            onClick={() => sendMessage(sug)}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message-bubble-row bot">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="chatbot-input-bar">
              <button
                className={`mic-btn ${isListening ? "active-listening" : ""}`}
                onClick={toggleVoiceInput}
                title={isListening ? "Listening... click to stop" : "Click to Speak"}
              >
                <FaMicrophone />
              </button>

              <input
                type="text"
                placeholder={isListening ? "Listening to your voice..." : "Ask combos, rush, calories, or specials..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="chat-text-input"
              />

              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                title="Send Message"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbotpage;
