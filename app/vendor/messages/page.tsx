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
  FiChevronDown,
  FiCornerUpLeft,
  FiCopy,
  FiSmile,
  FiX,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import { useEffect, useRef } from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

interface Message {
  id: string;
  sender: { id: string; name: string };
  content: string;
  timestamp: string;
  isMine: boolean;
  read: boolean;
  createdAt: string;
  replyTo?: {
    id: string;
    content: string;
    sender: { name: string };
  };
  reactions?: string[];
}

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
const mockMessages: { [key: string]: Message[] } = {
  "1": [
    {
      id: "1",
      sender: { id: "customer_1", name: "Rahul Sharma" },
      content: "Hello, I need AC repair service",
      timestamp: "10:30 AM",
      isMine: false,
      read: true,
      createdAt: "2023-10-27T10:30:00Z",
    },
    {
      id: "2",
      sender: { id: "vendor_1", name: "You" },
      content: "Hello! I'd be happy to help. What seems to be the issue with your AC?",
      timestamp: "10:32 AM",
      isMine: true,
      read: true,
      createdAt: "2023-10-27T10:32:00Z",
    },
    {
      id: "3",
      sender: { id: "customer_1", name: "Rahul Sharma" },
      content: "It's not cooling properly and making weird noises",
      timestamp: "10:35 AM",
      isMine: false,
      read: true,
      createdAt: "2023-10-27T10:35:00Z",
      reactions: ['😂']
    },
    {
      id: "4",
      sender: { id: "vendor_1", name: "You" },
      content: "I see. This could be a refrigerant issue or a compressor problem. I can come check it out.",
      timestamp: "10:37 AM",
      isMine: true,
      read: true,
      createdAt: "2023-10-27T10:37:00Z",
      reactions: ['👍']
    },
    {
      id: "5",
      sender: { id: "customer_1", name: "Rahul Sharma" },
      content: "Thank you! When can you come for the AC service?",
      timestamp: "10:40 AM",
      isMine: false,
      read: true,
      createdAt: "2023-10-27T10:40:00Z",
      replyTo: {
        id: "4",
        content: "I see. This could be a refrigerant issue or a compressor problem. I can come check it out.",
        sender: { name: "You" }
      }
    },
  ],
  "2": [
    {
      id: "1",
      sender: { id: "customer_2", name: "Priya Patel" },
      content: "Hi, I have a leaking kitchen sink",
      timestamp: "Yesterday 2:00 PM",
      isMine: false,
      read: true,
      createdAt: "2023-10-26T14:00:00Z",
    },
    {
      id: "2",
      sender: { id: "vendor_1", name: "You" },
      content: "I can help with that. Is it leaking from the faucet or the pipes underneath?",
      timestamp: "Yesterday 2:05 PM",
      isMine: true,
      read: true,
      createdAt: "2023-10-26T14:05:00Z",
    },
    {
      id: "3",
      sender: { id: "customer_2", name: "Priya Patel" },
      content: "From the pipes underneath",
      timestamp: "Yesterday 2:10 PM",
      isMine: false,
      read: true,
      createdAt: "2023-10-26T14:10:00Z",
    },
    {
      id: "4",
      sender: { id: "vendor_1", name: "You" },
      content: "I'll come with the necessary parts. I can be there tomorrow at 2 PM.",
      timestamp: "Yesterday 2:15 PM",
      isMine: true,
      read: true,
      createdAt: "2023-10-26T14:15:00Z",
    },
    {
      id: "5",
      sender: { id: "customer_2", name: "Priya Patel" },
      content: "The plumbing issue is resolved. Thanks!",
      timestamp: "1 hour ago",
      isMine: false,
      read: true,
      createdAt: "2023-10-27T09:00:00Z",
    },
  ],
};

export default function VendorMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMessageDropdown, setActiveMessageDropdown] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localMessages, setLocalMessages] = useState(mockMessages);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMessageDropdown(null);
      setReactionPickerMessageId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  useEffect(() => {
    if (!selectedConversation && mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0].id);
    }
  }, []);

  const handleRefresh = () => {
    // For mock data, just re-select the first conversation
    if (mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0].id);
      // Simulate loading state briefly if needed, but since it's mock, we skip for now
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (!messagesEndRef.current) return;

    // First scroll attempt
    messagesEndRef.current.scrollIntoView({ behavior });

    // Immediate second attempt for layout shifts
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100);

    // Final attempt for images/slow renders
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 500);
  };

  useEffect(() => {
    if (selectedConversation && localMessages[selectedConversation]) {
      setTimeout(() => scrollToBottom("smooth"), 100);
    }
  }, [localMessages, selectedConversation]);


  const selectedChat = mockConversations.find(
    (conv) => conv.id === selectedConversation
  );
  const messages = selectedConversation
    ? localMessages[selectedConversation] || []
    : [];

  const filteredConversations = mockConversations.filter((conv) =>
    conv.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversation) return;

    // Optimistic UI update
    setLocalMessages(prev => ({
      ...prev,
      [selectedConversation]: prev[selectedConversation].map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          return { ...msg, reactions: [...reactions, emoji] };
        }
        return msg;
      }),
    }));
    setReactionPickerMessageId(null);
    setActiveMessageDropdown(null);

    // Note: Vendor General currently uses mock data. 
    // This is where the API call would go once connected to the backend.
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(), // Unique ID for mock
      sender: { id: "vendor_1", name: "You" }, // Assuming vendor is "You"
      content: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      read: false, // Initially unread by customer
      createdAt: new Date().toISOString(),
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        sender: { name: replyingTo.isMine ? 'You' : replyingTo.sender.name }
      } : undefined,
    };

    setLocalMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMessage]
    }));
    setMessageText("");
    setReplyingTo(null); // Clear reply context
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">General Messages</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation.id);
                  setReplyingTo(null); // Clear reply context when changing conversation
                }}
                className={`w-full p-4 flex items-start gap-3 hover:bg-emerald-50 transition-colors border-b border-gray-100 ${selectedConversation === conversation.id ? "bg-emerald-50" : ""
                  }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold text-sm uppercase">
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
                    <span className="inline-block w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
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
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold text-sm uppercase">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMine ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg relative group pl-3 pr-2 pt-1.5 pb-1 ${msg.isMine
                      ? "bg-[#d9fdd3] text-gray-900 rounded-tr-none"
                      : "bg-white text-gray-900 rounded-tl-none shadow-sm"
                      } transition-opacity`}
                  >
                    {/* Dropdown Trigger */}
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setActiveMessageDropdown(activeMessageDropdown === msg.id ? null : msg.id);
                        setReactionPickerMessageId(null); // Close reaction picker if open
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-inherit z-10"
                    >
                      <FiChevronDown className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMessageDropdown === msg.id && (
                      <div
                        className={`absolute top-8 ${msg.isMine ? 'right-0' : 'left-0'} w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setReplyingTo(msg);
                            setActiveMessageDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FiCornerUpLeft className="w-4 h-4" /> Reply
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setActiveMessageDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FiCopy className="w-4 h-4" /> Copy
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReactionPickerMessageId(reactionPickerMessageId === msg.id ? null : msg.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FiSmile className="w-4 h-4" /> React
                          </button>
                          {reactionPickerMessageId === msg.id && (
                            <div className="absolute left-full top-0 ml-2 bg-white rounded-full shadow-lg border border-gray-100 p-1 flex items-center gap-1 z-[60]">
                              {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleAddReaction(msg.id, emoji)}
                                  className="hover:scale-125 transition-transform p-1 text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            if (selectedConversation) {
                              setLocalMessages(prev => ({
                                ...prev,
                                [selectedConversation]: prev[selectedConversation].filter(m => m.id !== msg.id)
                              }));
                            }
                            setActiveMessageDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <FiTrash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                    <div className="relative">
                      {msg.replyTo && (
                        <div className={`border-l-4 ${msg.isMine ? 'border-emerald-500' : 'border-gray-300'} pl-2 mb-1 py-0.5`}>
                          <p className="text-xs font-bold text-gray-600">Replying to {msg.replyTo.sender.name}</p>
                          <p className="text-sm text-gray-500 truncate">{msg.replyTo.content}</p>
                        </div>
                      )}
                      <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
                      <span className="float-right flex items-center gap-1 ml-2 mt-2 -mb-0.5">
                        <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                        {msg.isMine && (
                          msg.read ? (
                            <BsCheckAll className="w-4 h-4 text-[#53bdeb]" />
                          ) : (
                            <BsCheck className="w-4 h-4 text-gray-500" />
                          )
                        )}
                      </span>
                    </div>
                    {/* Reactions display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={`absolute -bottom-3 ${msg.isMine ? 'right-0' : 'left-0'} flex -space-x-1`}>
                        {msg.reactions.map((emoji, idx) => (
                          <span key={idx} className="bg-white rounded-full shadow-sm border border-gray-100 px-1 text-[12px]">
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview Box */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t border-emerald-200 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                <div className="border-l-4 border-emerald-500 pl-3 py-1 overflow-hidden">
                  <p className="text-xs font-bold text-emerald-700">Replying to {replyingTo.isMine ? 'Yourself' : replyingTo.sender.name}</p>
                  <p className="text-sm text-gray-600 truncate">{replyingTo.content}</p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none shadow-sm"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
