"use client";

import { useState } from "react";
import {
  FiSend,
  FiPaperclip,
  FiSearch,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiInfo,
} from "react-icons/fi";

// Mock conversations
const mockConversations = [
  {
    id: "1",
    customer: {
      name: "Rahul Sharma",
      avatar: "RS",
      status: "online",
    },
    lastMessage: "Thank you! When can you come for the AC service?",
    timestamp: "2 min ago",
    unread: 2,
    orderId: "ORD-1234",
  },
  {
    id: "2",
    customer: {
      name: "Priya Patel",
      avatar: "PP",
      status: "offline",
    },
    lastMessage: "The plumbing issue is resolved. Thanks!",
    timestamp: "1 hour ago",
    unread: 0,
    orderId: "ORD-1235",
  },
  {
    id: "3",
    customer: {
      name: "Amit Kumar",
      avatar: "AK",
      status: "online",
    },
    lastMessage: "Can you check the electrical issue tomorrow?",
    timestamp: "3 hours ago",
    unread: 1,
    orderId: "ORD-1236",
  },
  {
    id: "4",
    customer: {
      name: "Sneha Reddy",
      avatar: "SR",
      status: "offline",
    },
    lastMessage: "What colors do you recommend for the living room?",
    timestamp: "Yesterday",
    unread: 0,
    orderId: "ORD-1237",
  },
  {
    id: "5",
    customer: {
      name: "Vikram Singh",
      avatar: "VS",
      status: "online",
    },
    lastMessage: "The wardrobe looks amazing! Thank you!",
    timestamp: "2 days ago",
    unread: 0,
    orderId: "ORD-1238",
  },
];

// Mock messages for selected conversation
const mockMessages: { [key: string]: any[] } = {
  "1": [
    {
      id: "1",
      sender: "customer",
      text: "Hello, I need AC repair service",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      sender: "vendor",
      text: "Hello! I'd be happy to help. What seems to be the issue with your AC?",
      timestamp: "10:32 AM",
    },
    {
      id: "3",
      sender: "customer",
      text: "It's not cooling properly and making weird noises",
      timestamp: "10:35 AM",
    },
    {
      id: "4",
      sender: "vendor",
      text: "I see. This could be a refrigerant issue or a compressor problem. I can come check it out.",
      timestamp: "10:37 AM",
    },
    {
      id: "5",
      sender: "customer",
      text: "Thank you! When can you come for the AC service?",
      timestamp: "10:40 AM",
    },
  ],
  "2": [
    {
      id: "1",
      sender: "customer",
      text: "Hi, I have a leaking kitchen sink",
      timestamp: "Yesterday 2:00 PM",
    },
    {
      id: "2",
      sender: "vendor",
      text: "I can help with that. Is it leaking from the faucet or the pipes underneath?",
      timestamp: "Yesterday 2:05 PM",
    },
    {
      id: "3",
      sender: "customer",
      text: "From the pipes underneath",
      timestamp: "Yesterday 2:10 PM",
    },
    {
      id: "4",
      sender: "vendor",
      text: "I'll come with the necessary parts. I can be there tomorrow at 2 PM.",
      timestamp: "Yesterday 2:15 PM",
    },
    {
      id: "5",
      sender: "customer",
      text: "The plumbing issue is resolved. Thanks!",
      timestamp: "1 hour ago",
    },
  ],
};

export default function VendorMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    mockConversations[0].id
  );
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedChat = mockConversations.find(
    (conv) => conv.id === selectedConversation
  );
  const messages = selectedConversation
    ? mockMessages[selectedConversation] || []
    : [];

  const filteredConversations = mockConversations.filter((conv) =>
    conv.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Handle send message logic here
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-140px)] flex">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedConversation === conversation.id ? "bg-primary-50" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {conversation.customer.avatar}
                    </span>
                  </div>
                  {conversation.customer.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {conversation.customer.name}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {conversation.orderId}
                  </p>
                </div>

                {/* Unread Badge */}
                {conversation.unread > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-block w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conversation.unread}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {selectedChat.customer.avatar}
                    </span>
                  </div>
                  {selectedChat.customer.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedChat.customer.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedChat.customer.status === "online" ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiPhone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiVideo className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiInfo className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiMoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "vendor" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.sender === "vendor"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    } rounded-2xl px-4 py-2`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "vendor"
                          ? "text-primary-100"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiPaperclip className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
