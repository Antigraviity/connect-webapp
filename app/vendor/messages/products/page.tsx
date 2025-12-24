"use client";

import { useState } from "react";
import {
  FiMessageSquare,
  FiSearch,
  FiSend,
  FiPaperclip,
  FiMoreVertical,
  FiShoppingCart,
  FiTruck,
} from "react-icons/fi";

// Mock conversations data
const conversationsData = [
  {
    id: "1",
    customer: { name: "John Doe", avatar: "JD" },
    product: "Fresh Vegetables Basket",
    orderId: "ORD-2024-001234",
    lastMessage: "When will my order be delivered?",
    time: "10:30 AM",
    unread: 1,
    online: true,
    messages: [
      { id: "1", sender: "customer", content: "Hi, I placed an order for vegetables", timestamp: "9:00 AM" },
      { id: "2", sender: "me", content: "Hello! Yes, I received your order. Packing it now.", timestamp: "9:30 AM" },
      { id: "3", sender: "customer", content: "Great! Can you add extra tomatoes?", timestamp: "9:45 AM" },
      { id: "4", sender: "me", content: "Sure, I'll add some extra tomatoes for you!", timestamp: "10:00 AM" },
      { id: "5", sender: "customer", content: "When will my order be delivered?", timestamp: "10:30 AM" },
    ],
  },
  {
    id: "2",
    customer: { name: "Priya Singh", avatar: "PS" },
    product: "Organic Fruit Pack",
    orderId: "ORD-2024-001235",
    lastMessage: "Thank you! The fruits were very fresh",
    time: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      { id: "1", sender: "customer", content: "Are the fruits organic?", timestamp: "2:00 PM" },
      { id: "2", sender: "me", content: "Yes, all our fruits are 100% organic and pesticide-free.", timestamp: "2:15 PM" },
      { id: "3", sender: "customer", content: "Thank you! The fruits were very fresh", timestamp: "5:00 PM" },
    ],
  },
  {
    id: "3",
    customer: { name: "Amit Verma", avatar: "AV" },
    product: "Homemade Murukku",
    orderId: "ORD-2024-001236",
    lastMessage: "Can I order in bulk for a function?",
    time: "2 days ago",
    unread: 1,
    online: true,
    messages: [
      { id: "1", sender: "customer", content: "I loved your murukku!", timestamp: "11:00 AM" },
      { id: "2", sender: "me", content: "Thank you so much! Glad you enjoyed it.", timestamp: "11:30 AM" },
      { id: "3", sender: "customer", content: "Can I order in bulk for a function?", timestamp: "12:00 PM" },
    ],
  },
  {
    id: "4",
    customer: { name: "Neha Gupta", avatar: "NG" },
    product: "Farm Fresh Eggs",
    orderId: "ORD-2024-001237",
    lastMessage: "Order received, thank you!",
    time: "3 days ago",
    unread: 0,
    online: false,
    messages: [
      { id: "1", sender: "customer", content: "Hi, is the delivery free?", timestamp: "10:00 AM" },
      { id: "2", sender: "me", content: "Free delivery for orders above ₹200!", timestamp: "10:30 AM" },
      { id: "3", sender: "customer", content: "Order received, thank you!", timestamp: "4:00 PM" },
    ],
  },
];

export default function VendorProductMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationsData[0]?.id || null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversationsData.filter(
    (conv) =>
      conv.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversationsData.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setMessageInput("");
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <FiShoppingCart className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Product Messages</h1>
        </div>
        <p className="text-gray-600">Communicate with customers about their product orders</p>
      </div>

      {/* Messages Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex h-[calc(100%-80px)]">
        {/* Conversations List */}
        <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedConversation === conversation.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.customer.avatar}
                    </div>
                    {conversation.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">{conversation.customer.name}</h4>
                      <span className="text-xs text-gray-500">{conversation.time}</span>
                    </div>
                    <p className="text-xs text-blue-600 truncate flex items-center gap-1 mb-1">
                      <FiShoppingCart className="w-3 h-3" />
                      {conversation.product}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                      {conversation.unread > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {currentConversation ? (
          <div className="flex-1 flex flex-col hidden md:flex">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentConversation.customer.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentConversation.customer.name}</h3>
                    <p className="text-xs text-gray-600">
                      {currentConversation.product}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <FiTruck className="w-3 h-3" />
                    {currentConversation.orderId}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <FiMoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.sender === "me"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-900 shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.sender === "me" ? "text-blue-100" : "text-gray-500"}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <FiPaperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
