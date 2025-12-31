"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiMessageSquare,
  FiSearch,
  FiSend,
  FiPaperclip,
  FiMoreVertical,
  FiShoppingCart,
  FiTruck,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiX,
  FiImage,
  FiArrowLeft,
  FiZoomIn,
  FiZoomOut,
  FiDownload,
} from "react-icons/fi";

interface Customer {
  id: string;
  name: string;
  avatar: string;
  image?: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sender: "me" | "customer";
  timestamp: string;
  createdAt: string;
  read: boolean;
  attachment?: {
    url: string;
    name: string;
    type: string;
    size?: number;
  } | null;
}

interface Conversation {
  id: string;
  customer: Customer;
  product: string;
  productImage?: string | null;
  orderId?: string | null;
  orderDbId?: string | null;
  lastMessage: string;
  lastMessageTime: string;
  time: string;
  unread: number;
  online: boolean;
}

export default function VendorProductMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; senderName: string; senderImage?: any; timestamp: string } | null>(null);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch {
        setError("Failed to get user info");
      }
    } else {
      setError("Please login to view messages");
    }
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/vendor/messages/products?sellerId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
        // Auto-select first conversation if none selected
        if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0].id);
        }
      } else {
        setError(data.message || "Failed to load conversations");
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (customerId: string) => {
    if (!userId) return;

    try {
      setLoadingMessages(true);

      const response = await fetch(
        `/api/vendor/messages/products?sellerId=${userId}&customerId=${customerId}`
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        // Update unread count in conversations
        setConversations((prev) =>
          prev.map((c) =>
            c.id === customerId ? { ...c, unread: 0 } : c
          )
        );
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (customContent?: string, customAttachment?: any) => {
    // If customContent is provided (including empty string), use it. Otherwise use state.
    const content = customContent !== undefined ? customContent : messageInput.trim();

    // Must have either content or attachment
    if ((!content && !customAttachment) || !selectedConversation || !userId) return;

    if (!customAttachment) setMessageInput("");
    setSendingMessage(true);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: userId,
      receiverId: selectedConversation,
      sender: "me",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      createdAt: new Date().toISOString(),
      read: false,
      attachment: customAttachment,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const currentConv = conversations.find((c) => c.id === selectedConversation);

      const response = await fetch("/api/vendor/messages/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          receiverId: selectedConversation,
          content,
          orderId: currentConv?.orderDbId,
          attachment: customAttachment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? data.message : m))
        );
        // Update conversation last message
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation
              ? {
                ...c,
                lastMessage: customAttachment ? '📎 Attachment' : content,
                time: "Just now"
              }
              : c
          )
        );
      } else {
        // Remove temp message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        alert("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle file attachment
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation || !userId) return;

    setIsUploading(true);
    setSendingMessage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'messages');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (uploadData.success && uploadData.file) {
        const attachment = {
          url: uploadData.file.url,
          name: uploadData.file.name,
          type: uploadData.file.type,
          size: uploadData.file.size
        };
        // Reuse handleSendMessage with the attachment
        await handleSendMessage('', attachment);
      } else {
        alert(uploadData.message || 'Failed to upload file');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading file');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsUploading(false);
      setSendingMessage(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  if (loading && conversations.length === 0) {
    return (
      <div className="p-6 h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="p-6 h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-900 font-medium mb-2">Error loading messages</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchConversations}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1">
            <FiShoppingCart className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">Product Messages</h1>
          </div>
          <button
            onClick={fetchConversations}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
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
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No conversations yet</p>
                <p className="text-sm text-gray-400">
                  Messages from customers will appear here
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedConversation === conversation.id ? "bg-emerald-50" : ""
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {conversation.customer.image ? (
                        <img
                          src={conversation.customer.image}
                          alt={conversation.customer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {conversation.customer.avatar}
                        </div>
                      )}
                      {conversation.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conversation.customer.name}
                        </h4>
                        <span className="text-xs text-gray-500">{conversation.time}</span>
                      </div>
                      <p className="text-xs text-emerald-600 truncate flex items-center gap-1 mb-1">
                        <FiShoppingCart className="w-3 h-3" />
                        {conversation.product}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread > 0 && (
                          <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {currentConversation ? (
          <div className="flex-1 flex flex-col hidden md:flex">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentConversation.customer.image ? (
                    <img
                      src={currentConversation.customer.image}
                      alt={currentConversation.customer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {currentConversation.customer.avatar}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {currentConversation.customer.name}
                    </h3>
                    <p className="text-xs text-gray-600">{currentConversation.product}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentConversation.orderId && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <FiTruck className="w-3 h-3" />
                      {currentConversation.orderId}
                    </span>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <FiMoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <FiLoader className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FiMessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isImage = message.attachment &&
                      (message.attachment.type?.startsWith("image/") ||
                        message.attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));

                    return (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl ${isImage ? 'p-0 overflow-hidden' : 'px-4 py-2'} ${message.sender === "me"
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-gray-900 shadow-sm"
                            }`}
                        >
                          {message.attachment && (
                            <div className={isImage ? "relative group" : "mb-2"}>
                              {isImage ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setPreviewImage({
                                        url: message.attachment?.url || '',
                                        senderName: message.sender === "me" ? 'You' : (conversations.find(c => c.id === selectedConversation)?.customer.name || 'Customer'),
                                        senderImage: message.sender === "me" ? undefined : conversations.find(c => c.id === selectedConversation)?.customer.avatar,
                                        timestamp: message.timestamp
                                      });
                                      setScale(1);
                                    }}
                                    className="block w-full text-left focus:outline-none"
                                  >
                                    <img
                                      src={message.attachment.url}
                                      alt={message.attachment.name}
                                      className="max-w-full max-h-64 object-cover block"
                                    />
                                  </button>
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/40 text-white backdrop-blur-[2px]">
                                    {message.timestamp}
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                                  <FiPaperclip className="w-4 h-4" />
                                  <span className="text-sm truncate">
                                    {message.attachment.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {message.content && (
                            <div className={isImage ? "px-4 py-2" : ""}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          )}

                          {!isImage && (
                            <p
                              className={`text-xs mt-1 ${message.sender === "me" ? "text-emerald-100" : "text-gray-500"}`}
                            >
                              {message.timestamp}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || sendingMessage}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <FiLoader className="w-5 h-5 animate-spin text-emerald-600" />
                  ) : (
                    <FiPaperclip className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !sendingMessage && handleSendMessage()}
                  placeholder="Type a message..."
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-50"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!messageInput.trim() || sendingMessage}
                  className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiSend className="w-5 h-5" />
                  )}
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onClick={() => setPreviewImage(null)}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-sm z-50 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center text-white">
                {/* In products page, avatar might be a component or string */}
                {previewImage.senderImage || <div className="font-semibold">{previewImage.senderName[0]}</div>}
              </div>
              <div>
                <div className="text-white font-medium">{previewImage.senderName}</div>
                <div className="text-gray-400 text-xs">{previewImage.timestamp}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setScale(s => Math.min(s + 0.5, 3))}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <FiZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setScale(s => Math.max(s - 0.5, 0.5))}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <FiZoomOut className="w-5 h-5" />
              </button>
              <a
                href={previewImage.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Download"
                onClick={(e) => e.stopPropagation()}
              >
                <FiDownload className="w-5 h-5" />
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
            <img
              src={previewImage.url}
              alt="Preview"
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${scale})` }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
