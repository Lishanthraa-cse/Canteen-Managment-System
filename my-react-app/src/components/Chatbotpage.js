import React, { useState, useEffect, useRef } from "react";
import "./Chatbotpage.css"; // You can style this or switch to Tailwind fully

const Chatbotpage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your canteen assistant 🤖. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new message added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("http://localhost:5000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMessage = { from: "bot", text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Oops! Something went wrong." },
      ]);
    }

    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Button */}
      <button
        className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div className="chatbot-box w-80 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="chatbot-header bg-blue-600 text-white p-3 font-semibold text-lg">
            SREC Canteen Chatbot
          </div>

          {/* Messages */}
          <div className="chatbot-messages flex-1 p-3 overflow-y-auto max-h-96 space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message p-2 rounded-lg w-fit max-w-xs ${
                  msg.from === "user"
                    ? "ml-auto bg-blue-100 dark:bg-blue-800"
                    : "mr-auto bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="chatbot-input flex border-t border-gray-200 dark:border-gray-700 p-2">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-md px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbotpage;
