"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { FiMessageSquare, FiSearch, FiSend, FiPaperclip, FiUser, FiShoppingCart, FiPackage, FiTruck, FiLoader, FiAlertCircle, FiRefreshCw, FiArrowLeft, FiChevronDown, FiCornerUpLeft, FiCopy, FiSmile, FiX, FiTrash2 } from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { Suspense } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  userType: string | null;
  role: string;
}

interface Conversation {
  id: string;
  user: User;
  lastMessage: {
    content: string;
    attachment: string | null;
    createdAt: string;
    isFromMe: boolean;
  } | null;
  unreadCount: number;
  relatedBooking: {
    id: string;
    orderNumber: string;
    serviceName: string;
  } | null;
}

interface Message {
  id: string;
  content: string;
  attachment: string | null;
  read: boolean;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string;
    image: string | null;
  };
  timestamp: string;
  isMine: boolean;
  orderId?: string;
  replyTo?: {
    id: string;
    content: string;
    sender: { name: string };
  };
  reactions?: string[];
}

export default function ProductsMessagesPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    }>
      <ProductsMessagesContent />
    </Suspense>
  );
}

function ProductsMessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  // Support both 'chat' and 'sellerId' parameters for compatibility
  const sellerIdFromUrl = searchParams.get('chat') || searchParams.get('sellerId');
  const initialMessageId = searchParams.get('messageId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isNewConversation, setIsNewConversation] = useState(false);

  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [highlightedConversationId, setHighlightedConversationId] = useState<string | null>(null);

  const [activeMessageDropdown, setActiveMessageDropdown] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null); // New state
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null); // New state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);
  const prevMessagesCount = useRef(0);
  const isInitialLoad = useRef(true);
  const lastHighlightedId = useRef<string | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (messages.length > prevMessagesCount.current) {
      setTimeout(() => scrollToBottom("smooth"), 100);
    }
    prevMessagesCount.current = messages.length;
  }, [messages]);

  const fetchConversations = useCallback(async (preserveSelection = true, forceSelectLatest = false) => {
    if (!user?.id) return;

    if (!preserveSelection || forceSelectLatest) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/messages?userId=${user.id}&conversationList=true&type=PRODUCT`);
      const data = await response.json();

      if (data.success) {
        const productConversations = data.conversations || [];
        setConversations(productConversations);

        if ((!selectedConversationRef.current || forceSelectLatest) && productConversations.length > 0) {
          // Priority to URL ONLY if not forcing latest
          const targetId = (forceSelectLatest ? null : sellerIdFromUrl);
          const targetConv = targetId
            ? productConversations.find(
              (c: Conversation) => c.id === targetId || c.user?.id === targetId
            )
            : null;

          const finalConv = targetConv || productConversations[0];

          if (selectedConversationRef.current?.id === finalConv.id && forceSelectLatest) {
            fetchMessages(finalConv.id);
          } else {
            setSelectedConversation(finalConv);
            setIsNewConversation(false);
          }
        }
      } else {
        setError(data.message || "Failed to fetch conversations");
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to fetch conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, sellerIdFromUrl]);

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

  // Fetch conversations when user is available
  useEffect(() => {
    if (user?.id) {
      fetchConversations(false, true); // Pass true to forceSelectLatest on initial load
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchConversations]);

  // Handle sellerId from URL - auto-select or create conversation
  const urlHandledRef = useRef(false);

  useEffect(() => {
    // Only handle URL once after initial load
    if (sellerIdFromUrl && user?.id && !loading && !urlHandledRef.current) {
      // Check if conversation with this seller exists
      const existingConv = conversations.find(c => c.id === sellerIdFromUrl || c.user?.id === sellerIdFromUrl);
      if (existingConv) {
        // Only select if not already selected
        if (selectedConversation?.id !== existingConv.id) {
          setSelectedConversation(existingConv);
          setIsNewConversation(false);
          fetchMessages(existingConv.id);
          setShowMobileChat(true);
        }
        urlHandledRef.current = true;
      } else if (!selectedConversation || selectedConversation.id !== sellerIdFromUrl) {
        // Create a new conversation placeholder only if not already selected
        fetchSellerInfo(sellerIdFromUrl);
        urlHandledRef.current = true;
      }
    }
  }, [sellerIdFromUrl, conversations, user?.id, loading, selectedConversation]);

  const fetchSellerInfo = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/users/${sellerId}`);
      const data = await response.json();
      if (data.success && data.user) {
        const newConv: Conversation = {
          id: sellerId,
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            image: data.user.image,
            userType: data.user.userType,
            role: data.user.role,
          },
          lastMessage: null,
          unreadCount: 0,
          relatedBooking: null,
        };
        setSelectedConversation(newConv);
        setIsNewConversation(true);
        setShowMobileChat(true);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching seller info:', err);
    }
  };

  // Handle message highlighting from URL
  useEffect(() => {
    // 1. Handle sidebar highlight
    if (sellerIdFromUrl && conversations.length > 0) {
      const conv = conversations.find(c => c.id === sellerIdFromUrl || c.user?.id === sellerIdFromUrl);
      if (conv && !lastHighlightedId.current?.includes(`conv-${conv.id}`)) {
        console.log("🔍 Conversation sidebar highlight triggered:", conv.id);
        setHighlightedConversationId(conv.id);
        const timer = setTimeout(() => setHighlightedConversationId(null), 3500);
        lastHighlightedId.current = (lastHighlightedId.current || "") + `conv-${conv.id}`;
      }
    }

    // 2. Handle message-specific highlight
    if (initialMessageId && messages.length > 0 && !lastHighlightedId.current?.includes(`msg-${initialMessageId}`)) {
      console.log("🔍 Message deep-link detected:", initialMessageId);

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
          console.log("❌ Message element NOT found! ID:", initialMessageId);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [messages, initialMessageId, sellerIdFromUrl, conversations]);

  // Auto-scroll to bottom when messages change (STRICTER CONTROL)
  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesCount.current;

    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      const sentByMe = lastMessage?.senderId === user?.id;

      // Only scroll if: first load (and not deep-linking), I sent it, or user is already at bottom
      if (!initialMessageId && (isInitialLoad.current || sentByMe)) {
        scrollToBottom();
      } else if (!isInitialLoad.current && !sentByMe) {
        // Optional: Show "New message" toast instead of scrolling
      }

      if (isInitialLoad.current && messages.length > 0) {
        isInitialLoad.current = false;
      }
    }
    prevMessagesCount.current = messages.length;
  }, [messages, user?.id, initialMessageId]);

  // Poll for new messages every 10 seconds (only for existing conversations)
  useEffect(() => {
    if (selectedConversation && user?.id && !isNewConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id, true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, user?.id, isNewConversation]);



  const fetchMessages = async (otherUserId: string, silent = false) => {
    if (!user?.id) {
      setMessagesLoading(false);
      return;
    }

    if (!silent) {
      setMessagesLoading(true);
    }

    try {
      console.log('Fetching messages for:', otherUserId);
      const response = await fetch(`/api/messages?userId=${user.id}&otherUserId=${otherUserId}&type=PRODUCT`);
      const data = await response.json();
      console.log('Messages response:', data);

      if (data.success) {
        // Add isMine property to messages
        const processedMessages = data.messages.map((msg: Message) => ({
          ...msg,
          isMine: msg.senderId === user.id,
          timestamp: msg.createdAt, // Assuming createdAt can be used as timestamp
        }));
        setMessages(processedMessages || []);

        if (!silent) {
          setTimeout(() => scrollToBottom("instant"), 50);
        }

        // Update unread count in conversation list
        setConversations(prev =>
          prev.map(conv =>
            conv.id === otherUserId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      } else {
        console.error('Failed to fetch messages:', data.message);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsNewConversation(false);
    fetchMessages(conversation.id);
    setShowMobileChat(true);
    setReplyingTo(null); // Clear reply state when changing conversation
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user?.id || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);
    setNewMessage(""); // Clear input immediately for better UX
    setReplyingTo(null); // Clear replyingTo state

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedConversation.id,
          content: messageContent,
          type: 'PRODUCT',
          replyToId: replyingTo?.id, // Include replyToId
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add the new message to the list
        setMessages(prev => [...prev, { ...data.data, isMine: true, timestamp: data.data.createdAt }]);

        // If this was a new conversation, add it to the conversations list
        if (isNewConversation) {
          const newConv: Conversation = {
            ...selectedConversation,
            lastMessage: {
              content: messageContent,
              attachment: null,
              createdAt: new Date().toISOString(),
              isFromMe: true
            }
          };
          setConversations(prev => [newConv, ...prev]);
          setIsNewConversation(false);
        } else {
          // Update last message in existing conversation list
          setConversations(prev =>
            prev.map(conv =>
              conv.id === selectedConversation.id
                ? {
                  ...conv,
                  lastMessage: {
                    content: messageContent,
                    attachment: null,
                    createdAt: new Date().toISOString(),
                    isFromMe: true
                  }
                }
                : conv
            )
          );
        }

        // Refresh conversations list after a short delay to get server state
        setTimeout(() => {
          fetchConversations(true);
        }, 1000);
      } else {
        setNewMessage(messageContent); // Restore message on error
        alert(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setNewMessage(messageContent); // Restore message on error
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get all conversations including the new one if applicable
  const allConversations = isNewConversation && selectedConversation &&
    !conversations.find(c => c.id === selectedConversation.id)
    ? [selectedConversation, ...conversations]
    : conversations;

  // Filter conversations
  const filteredConversations = allConversations.filter(conv =>
    conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.relatedBooking?.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Total unread count
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">You need to be signed in to view your messages.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Messages</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchConversations(false, true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FiShoppingCart className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Product Messages</h1>
          </div>
          <button
            onClick={() => fetchConversations(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <p className="text-gray-600">Communicate with sellers about your orders</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`w-full md:w-96 border-r border-gray-200 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
                  {totalUnread > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

              </div>

              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search product conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? "No conversations match your search" : "No conversations yet"}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Contact sellers from your orders to start a conversation
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      id={`conversation-${conversation.id}`}
                      onClick={() => selectConversation(conversation)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                        } ${highlightedConversationId === conversation.id ? "animate-highlight" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            {conversation.user?.image ? (
                              <img
                                src={conversation.user.image}
                                alt={conversation.user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <FiUser className="w-6 h-6 text-white" />
                            )}
                          </div>
                          {isNewConversation && conversation.id === selectedConversation?.id && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" title="New conversation"></span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {conversation.user?.name || 'Unknown Seller'}
                              </h4>
                              {conversation.relatedBooking && (
                                <p className="text-xs text-blue-600 truncate flex items-center gap-1">
                                  <FiPackage className="w-3 h-3" />
                                  {conversation.relatedBooking.serviceName}
                                </p>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            {conversation.lastMessage ? (
                              <p className={`text-sm truncate flex-1 ${conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                {conversation.lastMessage.isFromMe && <span className="text-gray-400">You: </span>}
                                {conversation.lastMessage.content || '[Attachment]'}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No messages yet</p>
                            )}
                            {conversation.unreadCount > 0 && (
                              <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowMobileChat(false)}
                        className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
                      >
                        <FiArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          {selectedConversation.user?.image ? (
                            <img
                              src={selectedConversation.user.image}
                              alt={selectedConversation.user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.user?.name || 'Unknown Seller'}
                        </h3>
                        {selectedConversation.relatedBooking ? (
                          <p className="text-xs text-gray-600">
                            <span className="text-blue-600">{selectedConversation.relatedBooking.serviceName}</span>
                          </p>
                        ) : isNewConversation ? (
                          <p className="text-xs text-green-600">New conversation</p>
                        ) : null}
                      </div>
                    </div>
                    {selectedConversation.relatedBooking && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <FiTruck className="w-3 h-3" />
                        {selectedConversation.relatedBooking.orderNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                        <p className="text-gray-400 text-sm mt-1">Send a message to {selectedConversation.user?.name}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => {
                        const isMe = message.senderId === user.id;
                        const messageTimestamp = formatMessageTime(message.createdAt);
                        return (
                          <div
                            key={message.id}
                            id={`message-${message.id}`}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] relative ${isMe ? 'order-1' : ''}`}>
                              <div
                                className={`rounded-lg relative group pl-3 pr-2 pt-1.5 pb-1 ${isMe
                                  ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                                  : 'bg-white text-gray-900 rounded-tl-none shadow-sm'
                                  } ${highlightedMessageId === message.id ? "animate-highlight" : ""}`}
                              >
                                {/* Dropdown Trigger */}
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

                                {/* Dropdown Menu */}
                                {activeMessageDropdown === message.id && (
                                  <div
                                    className={`absolute top-8 ${isMe ? 'right-0' : 'left-0'} w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50`}
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
                                        setMessages(prev => prev.filter(m => m.id !== message.id));
                                        setActiveMessageDropdown(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <FiTrash2 className="w-4 h-4" /> Delete
                                    </button>
                                  </div>
                                )}
                                {/* Quoted Message Preview */}
                                {message.replyTo && (
                                  <div className={`mb-2 p-2 rounded border-l-4 ${isMe ? 'bg-black/5 border-emerald-500' : 'bg-gray-100 border-gray-400'} text-xs`}>
                                    <p className="font-bold mb-0.5 text-emerald-700">{message.replyTo.sender.name}</p>
                                    <p className="truncate opacity-80">{message.replyTo.content}</p>
                                  </div>
                                )}
                                <div className="relative">
                                  <span className="text-sm whitespace-pre-wrap break-words">{message.content}</span>
                                  <span className="float-right flex items-center gap-1 ml-2 mt-2 -mb-0.5">
                                    <span className="text-[10px] text-gray-500">
                                      {messageTimestamp}
                                    </span>
                                    {isMe && (
                                      <span className="text-xs">
                                        {message.read ? (
                                          <BsCheckAll className="w-4 h-4 text-[#53bdeb]" />
                                        ) : (
                                          <BsCheckAll className="w-4 h-4 text-gray-400" />
                                        )}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              {/* Reactions display */}
                              {message.reactions && message.reactions.length > 0 && (
                                <div className={`absolute -bottom-3 ${isMe ? 'right-0' : 'left-0'} flex -space-x-1`}>
                                  {message.reactions.map((emoji, idx) => (
                                    <span key={idx} className="bg-white rounded-full shadow-sm border border-gray-100 px-1 text-[12px]">
                                      {emoji}
                                    </span>
                                  ))}
                                </div>
                              )}
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
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={sendMessage} className="flex items-center gap-2">
                    <button type="button" className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                      <FiPaperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 h-10 px-4 border border-gray-300 rounded-full text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                    ></textarea>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <FiLoader className="w-5 h-5 animate-spin" />
                      ) : (
                        <FiSend className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conversation Selected</h3>
                  <p className="text-gray-600">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
