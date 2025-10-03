'use client'
import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { DashboardLayout } from "./dashboard-layout";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);

    // Mock bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I see! Tell me more." },
      ]);
    }, 1000);

    setInput("");
  };

  return (
    <DashboardLayout>
    <div className="flex flex-col w-full mx-auto h-[100vh] border rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-md ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex items-center gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
}
