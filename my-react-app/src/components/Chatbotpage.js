import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaMicrophone,
  FaVolumeUp,
  FaVolumeMute,
  FaShoppingCart,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import "./Chatbotpage.css";

const Chatbotpage = () => {
  const { addToCart, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi! I'm your SREC Canteen AI Concierge. Ask me about today's dishes, budget meals (e.g., 'under ₹50'), specials, or pure veg options!",
      suggestions: ["What's under ₹50?", "Today's Specials", "Show Pure Veg Items", "Canteen Timings"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Voice synthesis output (Text-to-Speech)
  const speakText = useCallback((text) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#•]/g, "").replace(/₹/g, "rupees ");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  }, [speechEnabled]);

  const sendMessage = useCallback(async (textToSend) => {
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

      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      const botReply = data.response || "Here is what I found for you!";

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: botReply,
          item: data.item,
          suggestions: data.suggestions,
        },
      ]);

      speakText(botReply);
    } catch (error) {
      console.error("Chatbot request failed:", error);
      console.warn("Chatbot backend offline or slow, using smart offline fallback:", error.message);
      
      const q = query.toLowerCase();
      let offlineReply = "";
      let offlineSuggestions = ["What's under ₹50?", "Show Specials", "Pure Veg Items"];

      if (q.includes("50") || q.includes("budget") || q.includes("under")) {
        offlineReply = "Here are popular budget items under ₹50:\n• Masala Dosa (₹50)\n• Idli Vada Combo (₹40)\n• Pongal (₹45)\n• Samosa (₹25)\n• Filter Coffee (₹20)\n• Masala Chai (₹15)";
        offlineSuggestions = ["Masala Dosa", "Idli Vada Combo", "Filter Coffee"];
      } else if (q.includes("special") || q.includes("offer") || q.includes("deal")) {
        offlineReply = "⭐ Today's Specials:\n• South Indian Thali Special - ₹80\n• Crispy Ghee Roast Dosa - ₹60\n• Fresh Lime Soda - ₹30";
      } else if (q.includes("veg") && !q.includes("non")) {
        offlineReply = "🌱 Pure Veg Favorites:\n• Masala Dosa (₹50)\n• Idli Vada Combo (₹40)\n• South Indian Thali (₹80)\n• Veg Fried Rice (₹75)";
      } else if (q.includes("non-veg") || q.includes("chicken")) {
        offlineReply = "🍗 Non-Veg Selections:\n• Chicken Biryani (₹140)\n• Egg Puffs (₹25)\n• Chicken 65 Roll (₹90)";
      } else if (q.includes("timing") || q.includes("hours") || q.includes("open")) {
        offlineReply = "⏰ SREC Canteen is open Monday to Saturday, 7:30 AM to 7:00 PM!\nBreakfast: 7:30 AM - 11:00 AM\nLunch: 11:30 AM - 3:00 PM\nSnacks: 3:30 PM - 6:30 PM";
      } else if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
        offlineReply = "👋 Hello! Welcome to SREC Smart Canteen! I can help you find dishes under your budget, show specials, or check canteen timings.";
      } else if (q.includes("dosa")) {
        offlineReply = "Masala Dosa is freshly made and costs ₹50! Crispy fermented crepe served with hot sambar and coconut chutney.";
        offlineSuggestions = ["Add Masala Dosa to Cart", "Filter Coffee"];
      } else if (q.includes("coffee") || q.includes("tea")) {
        offlineReply = "☕ Fresh Filter Coffee is ₹20 and Hot Masala Chai is ₹15! Perfect boost for your study day.";
      } else {
        offlineReply = `I can help you browse today's menu and prices! Popular items right now:\n• Masala Dosa (₹50)\n• South Indian Thali (₹80)\n• Veg Fried Rice (₹75)\n• Filter Coffee (₹20)`;
      }

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: offlineReply,
          suggestions: offlineSuggestions,
        },
      ]);
      speakText(offlineReply);
    } finally {
      setLoading(false);
    }
  }, [input, speakText]);

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

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      showToast("Voice recognition is not supported in this browser.", "info");
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

  return (
    <div className="modern-chatbot-root">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="chatbot-floating-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open Canteen Assistant"
        >
          <div className="btn-icon-wrapper">
            <FaRobot />
          </div>
          <span className="btn-label">Ask CanteenBot</span>
          <span className="online-dot"></span>
        </button>
      )}

      {/* Chatbox Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-topbar">
            <div className="topbar-info">
              <div className="bot-avatar">
                <FaRobot />
              </div>
              <div>
                <h3 className="bot-title">CanteenBot AI</h3>
                <span className="bot-status">
                  <span className="dot"></span> Online • SREC Kitchen
                </span>
              </div>
            </div>

            <div className="topbar-actions">
              <button
                className="action-icon-btn"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                title={speechEnabled ? "Mute Voice Speech" : "Enable Voice Speech"}
              >
                {speechEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
              </button>
              <button
                className="action-icon-btn close-btn"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble-row ${msg.from}`}>
                <div className="bubble-content">
                  <p className="bubble-text">{msg.text}</p>

                  {/* Direct Add to Cart Action if item was identified */}
                  {msg.item && (
                    <div className="item-quick-card">
                      {msg.item.image && (
                        <img src={msg.item.image} alt={msg.item.name} className="item-thumb" />
                      )}
                      <div className="item-info">
                        <strong>{msg.item.name}</strong>
                        <span>₹{msg.item.price}</span>
                      </div>
                      <button
                        className="add-cart-mini-btn"
                        onClick={() => addToCart(msg.item, 1)}
                      >
                        <FaShoppingCart /> Add
                      </button>
                    </div>
                  )}

                  {/* Suggestion Chips */}
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
              title={isListening ? "Listening..." : "Click to Speak"}
            >
              <FaMicrophone />
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening to your voice..." : "Ask menu, price, specials..."}
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
      )}
    </div>
  );
};

export default Chatbotpage;
