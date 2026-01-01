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
  FiChevronDown,
  FiCornerUpLeft,
  FiCopy,
  FiSmile,
  FiTrash2,
} from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
  isMine: boolean; // Added
  timestamp: string;
  createdAt: string;
  read: boolean;
  attachment?: {
    url: string;
    name: string;
    type: string;
    size?: number;
  } | null;
  replyTo?: {
    id: string;
    content: string;
    sender: { name: string };
  };
  reactions?: string[];
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

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

function VendorProductMessagesContent() {
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
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [highlightedConversationId, setHighlightedConversationId] = useState<string | null>(null);
  const [activeMessageDropdown, setActiveMessageDropdown] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const initialCustomerId = searchParams.get("customerId") || searchParams.get("chat");
  const initialMessageId = searchParams.get("messageId");
  const prevMessagesCount = useRef(0);
  const isInitialLoad = useRef(true);
  const lastHighlightedId = useRef<string | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const fetchConversations = async (forceSelectLatest = false) => {
    if (!userId) return;

    try {
      if (forceSelectLatest) setLoading(true);
      setError(null);

      const response = await fetch(`/api/vendor/messages/products?sellerId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
        // Auto-select first conversation if none selected
        if (data.conversations.length > 0 && (!selectedConversation || forceSelectLatest)) {
          // Priority to customerId from URL ONLY if not forcing latest
          const targetId = (forceSelectLatest ? null : initialCustomerId) || data.conversations[0].id;

          if (selectedConversation === targetId && forceSelectLatest) {
            fetchMessages(targetId);
          } else {
            setSelectedConversation(targetId);
          }
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

  const handleAddReaction = async (messageId: string, emoji: string) => {
    // Optimistic UI update
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        return { ...msg, reactions: [...reactions, emoji] };
      }
      return msg;
    }));
    setReactionPickerMessageId(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to add reaction:', data.message);
      } else {
        // Sync with server reactions
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, reactions: data.reactions } : msg
        ));
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
    setActiveMessageDropdown(null);
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (customerId: string, silent = false) => {
    if (!userId) return;

    try {
      if (!silent) setLoadingMessages(true);

      const response = await fetch(
        `/api/vendor/messages/products?sellerId=${userId}&customerId=${customerId}`
      );
      const data = await response.json();

      if (data.success) {
        const fetchedMessages = data.messages.map((msg: any) => ({
          ...msg,
          isMine: msg.sender === "me"
        }));

        setMessages(prev => {
          const optimistic = prev.filter(m => m.id.startsWith('temp-'));
          const currentNonOptimistic = prev.filter(m => !m.id.startsWith('temp-'));

          if (silent && JSON.stringify(fetchedMessages) === JSON.stringify(currentNonOptimistic)) {
            return prev;
          }

          return [...fetchedMessages, ...optimistic];
        });

        if (!silent) {
          setTimeout(() => scrollToBottom("instant"), 50);
        }
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

  // Fetch conversations
  useEffect(() => {
    if (userId) {
      fetchConversations(true);
    }
  }, [userId]);

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
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Handle message highlighting from URL
  useEffect(() => {
    // 1. Handle sidebar highlight when conversation is selected from URL
    if (initialCustomerId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === initialCustomerId);
      if (conv && !lastHighlightedId.current?.includes(`conv-${initialCustomerId}`)) {
        console.log("🔍 Conversation sidebar highlight triggered:", initialCustomerId);
        setHighlightedConversationId(initialCustomerId);
        const timer = setTimeout(() => setHighlightedConversationId(null), 3500);
        lastHighlightedId.current = (lastHighlightedId.current || "") + `conv-${initialCustomerId}`;
      }
    }

    // 2. Handle message-specific highlight
    if (initialMessageId && messages.length > 0 && !lastHighlightedId.current?.includes(`msg-${initialMessageId}`)) {
      console.log("🔍 Message deep-link detected:", initialMessageId);
      console.log("📋 Available message IDs in list:", messages.map(m => m.id));

      const timer = setTimeout(() => {
        const messageElement = document.getElementById(`message-${initialMessageId}`);
        if (messageElement) {
          console.log("✅ Found message element, scrolling and flashing:", initialMessageId);
          messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

          setHighlightedMessageId(initialMessageId);
          lastHighlightedId.current = (lastHighlightedId.current || "") + `msg-${initialMessageId}`;

          if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = setTimeout(() => {
            console.log("🧹 Clearing message highlight:", initialMessageId);
            setHighlightedMessageId(null);
          }, 3500);
        } else {
          console.log("❌ Message element NOT found! Looked for ID:", `message-${initialMessageId}`);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [messages, initialMessageId, initialCustomerId, conversations]);

  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesCount.current;

    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      const sentByMe = lastMessage?.sender === "me";

      // Get scroll container
      const container = messagesEndRef.current?.parentElement;
      const isAtBottom = container
        ? container.scrollHeight - container.scrollTop <= container.clientHeight + 150
        : true;

      // Scroll if: first load of messages, I sent it, or user is already at bottom
      if (isInitialLoad.current || sentByMe || isAtBottom) {
        scrollToBottom();
        if (isInitialLoad.current && messages.length > 0) {
          isInitialLoad.current = false;
        }
      }
    }

    prevMessagesCount.current = messages.length;
  }, [messages]);

  // Send message
  const handleSendMessage = async (customContent?: string, customAttachment?: any) => {
    // If customContent is provided (including empty string), use it. Otherwise use state.
    const content = customContent !== undefined ? customContent : messageInput.trim();

    // Must have either content or attachment
    if ((!content && !customAttachment) || !selectedConversation || !userId) return;

    if (!customAttachment) setMessageInput("");
    setReplyingTo(null); // Clear replyingTo after sending
    setSendingMessage(true);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: userId,
      receiverId: selectedConversation,
      sender: "me",
      isMine: true, // Added
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      createdAt: new Date().toISOString(),
      read: false,
      attachment: customAttachment,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        sender: { name: replyingTo.isMine ? 'You' : (conversations.find(c => c.id === selectedConversation)?.customer.name || 'Customer') }
      } : undefined,
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
          type: 'PRODUCT', // Added
          orderId: currentConv?.orderDbId,
          attachment: customAttachment,
          replyToId: replyingTo?.id, // Added
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? { ...data.message, isMine: true } : m)) // Ensure isMine is set
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
            onClick={() => fetchConversations(true)}
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
            onClick={() => fetchConversations(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
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
                  id={`conversation-${conversation.id}`}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedConversation === conversation.id ? "bg-emerald-50" : ""
                    } ${highlightedConversationId === conversation.id ? "animate-highlight" : ""}`}
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
                    const isTemp = message.id.startsWith('temp-');

                    const isImage = message.attachment &&
                      (message.attachment.type?.startsWith("image/") ||
                        message.attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));

                    return (
                      <div
                        key={message.id}
                        id={`message-${message.id}`}
                        className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg relative group ${isImage ? 'p-0 overflow-hidden' : 'pl-3 pr-2 pt-1.5 pb-1'} ${message.sender === "me"
                            ? "bg-[#d9fdd3] text-gray-900 rounded-tr-none"
                            : "bg-white text-gray-900 rounded-tl-none shadow-sm"
                            } ${highlightedMessageId === message.id ? "animate-highlight" : ""}`}
                        >
                          {/* Dropdown Trigger */}
                          {!isImage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMessageDropdown(activeMessageDropdown === message.id ? null : message.id);
                                setReactionPickerMessageId(null); // Close reaction picker if open
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-inherit z-10"
                            >
                              <FiChevronDown className="w-4 h-4" />
                            </button>
                          )}

                          {/* Dropdown Menu */}
                          {activeMessageDropdown === message.id && (
                            <div
                              className={`absolute top-8 ${message.sender === "me" ? 'right-0' : 'left-0'} w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setReplyingTo(message);
                                  setActiveMessageDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FiCornerUpLeft className="w-4 h-4" /> Reply
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(message.content);
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
                                    setReactionPickerMessageId(reactionPickerMessageId === message.id ? null : message.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <FiSmile className="w-4 h-4" /> React
                                </button>
                                {reactionPickerMessageId === message.id && (
                                  <div className="absolute left-full top-0 ml-2 bg-white rounded-full shadow-lg border border-gray-100 p-1 flex items-center gap-1 z-[60]">
                                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => handleAddReaction(message.id, emoji)}
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
                                  // This is a client-side only delete for now.
                                  // In a real app, you'd send an API request to delete the message.
                                  setMessages(prev => prev.filter(m => m.id !== message.id));
                                  setActiveMessageDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <FiTrash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}

                          {/* Reply Preview */}
                          {message.replyTo && (
                            <div className={`mb-2 p-2 rounded-md ${message.sender === "me" ? 'bg-emerald-100' : 'bg-gray-100'} border-l-4 border-emerald-500`}>
                              <p className="text-xs font-bold text-emerald-700">Replying to {message.replyTo.sender.name}</p>
                              <p className="text-sm text-gray-600 truncate">{message.replyTo.content}</p>
                            </div>
                          )}

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
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/40 text-white backdrop-blur-[2px] flex items-center gap-1">
                                    <span>{message.timestamp}</span>
                                    {message.sender === "me" && (
                                      isTemp ? (
                                        <BsCheck className="w-3 h-3 text-white" />
                                      ) : message.read ? (
                                        <BsCheckAll className="w-3 h-3 text-blue-400" />
                                      ) : (
                                        <BsCheckAll className="w-3 h-3 text-white" />
                                      )
                                    )}
                                  </div>
                                </>
                              ) : (
                                <a
                                  href={message.attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-lg ${message.sender === "me" ? 'bg-[#d1f2cc]' : 'bg-gray-100'
                                    }`}
                                >
                                  <FiPaperclip className="w-5 h-5 text-gray-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-gray-900">
                                      {message.attachment.name || 'File'}
                                    </p>
                                    {message.attachment.size && (
                                      <p className="text-xs text-gray-500">
                                        {formatFileSize(message.attachment.size)}
                                      </p>
                                    )}
                                  </div>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Message content and Timestamp logic */}
                          <div className="relative">
                            {message.content && (
                              <span className="text-sm whitespace-pre-wrap">{message.content}</span>
                            )}
                            {!isImage && (
                              <span className="float-right flex items-center gap-1 ml-2 mt-2 -mb-0.5">
                                <span className="text-[10px] text-gray-500">{message.timestamp}</span>
                                {message.sender === "me" && (
                                  isTemp ? (
                                    <BsCheck className="w-4 h-4 text-gray-400" />
                                  ) : message.read ? (
                                    <BsCheckAll className="w-4 h-4 text-[#53bdeb]" />
                                  ) : (
                                    <BsCheckAll className="w-4 h-4 text-gray-400" />
                                  )
                                )}
                              </span>
                            )}
                            {/* Reactions display */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className={`absolute -bottom-3 ${message.isMine ? 'right-0' : 'left-0'} flex -space-x-1`}>
                                {message.reactions.map((emoji, idx) => (
                                  <span key={idx} className="bg-white rounded-full shadow-sm border border-gray-100 px-1 text-[12px]">
                                    {emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply Preview Box */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t border-emerald-200 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                <div className="border-l-4 border-emerald-500 pl-3 py-1 overflow-hidden">
                  <p className="text-xs font-bold text-emerald-700">Replying to {replyingTo.isMine ? 'Yourself' : (conversations.find(c => c.id === selectedConversation)?.customer.name || 'Customer')}</p>
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
                <textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none h-10"
                  rows={1}
                ></textarea>
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

export default function VendorProductMessages() {
  return (
    <Suspense fallback={
      <div className="p-6 h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    }>
      <VendorProductMessagesContent />
    </Suspense>
  );
}
