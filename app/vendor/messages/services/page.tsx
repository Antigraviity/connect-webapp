"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiMessageSquare,
  FiSearch,
  FiSend,
  FiPaperclip,
  FiMoreVertical,
  FiRefreshCw,
  FiPackage,
  FiArrowLeft,
  FiX,
  FiZoomIn,
  FiZoomOut,
  FiDownload,
  FiChevronDown,
  FiCornerUpLeft,
  FiCopy,
  FiSmile,
  FiTrash2,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sender: User;
  receiver: User;
  read: boolean;
  createdAt: string;
  timestamp: string;
  isMine: boolean;
  orderId?: string;
  attachment?: any;
  replyTo?: {
    id: string;
    content: string;
    sender: { name: string };
  };
  reactions?: string[];
}

interface LastMessageObj {
  content: string;
  attachment?: string | null;
  createdAt: string;
  isFromMe: boolean;
}

interface Conversation {
  id: string;
  otherUser: User;
  lastMessage: string | LastMessageObj;
  lastMessageTime: string;
  unreadCount: number;
  time: string;
  service?: {
    id: string;
    title: string;
  };
  order?: {
    id: string;
    orderNumber: string;
  };
}

// Helper to get last message text
const getLastMessageText = (lastMessage: string | LastMessageObj | null | undefined): string => {
  if (!lastMessage) return 'No messages yet';
  if (typeof lastMessage === 'string') return lastMessage;
  if (typeof lastMessage === 'object' && lastMessage.content) return lastMessage.content;
  if (typeof lastMessage === 'object' && lastMessage.attachment) return '📎 Attachment';
  return 'No messages yet';
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

function VendorServiceMessagesContent() {
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; senderName: string; senderImage?: string; timestamp: string } | null>(null);
  const [scale, setScale] = useState(1);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [highlightedConversationId, setHighlightedConversationId] = useState<string | null>(null);
  const [activeMessageDropdown, setActiveMessageDropdown] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const initialOtherUserId = searchParams.get("conversationWith") || searchParams.get("chat");
  const initialMessageId = searchParams.get("messageId");
  const prevMessagesCount = useRef(0);
  const isInitialLoad = useRef(true);
  const lastHighlightedId = useRef<string | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle file attachment
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation || !currentUser?.id) return;

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

  // Load current user
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    if (currentUser?.id) {
      fetchConversations(true);
    }
  }, [currentUser]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMessageDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation && currentUser?.id) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, currentUser?.id]);

  // Handle message highlighting from URL
  useEffect(() => {
    // 1. Handle sidebar highlight when conversation is selected from URL
    if (initialOtherUserId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === initialOtherUserId);
      if (conv && !lastHighlightedId.current?.includes(`conv-${initialOtherUserId}`)) {
        console.log("🔍 Conversation sidebar highlight triggered:", initialOtherUserId);
        setHighlightedConversationId(initialOtherUserId);
        const timer = setTimeout(() => setHighlightedConversationId(null), 3500);
        lastHighlightedId.current = (lastHighlightedId.current || "") + `conv-${initialOtherUserId}`;
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
  }, [messages, initialMessageId, initialOtherUserId, conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesCount.current;

    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      const sentByMe = lastMessage?.isMine;

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

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!selectedConversation || !currentUser?.id) return;

    const interval = setInterval(() => {
      fetchMessages(selectedConversation, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation, currentUser?.id]);

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

  const fetchConversations = async (forceSelectLatest = false) => {
    try {
      if (forceSelectLatest) setLoading(true);
      const response = await fetch(`/api/messages?userId=${currentUser?.id}&type=SERVICE`);
      const result = await response.json();

      if (result.success) {
        setConversations(result.conversations || []);
        // Auto-select first conversation if none selected
        if ((!selectedConversation || forceSelectLatest) && result.conversations && result.conversations.length > 0) {
          // Priority to conversationWith from URL ONLY if not forcing latest
          const targetId = (forceSelectLatest ? null : initialOtherUserId) || result.conversations[0].id;

          if (selectedConversation === targetId && forceSelectLatest) {
            fetchMessages(targetId);
          } else {
            setSelectedConversation(targetId);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(
        `/api/messages?userId=${currentUser?.id}&conversationWith=${otherUserId}&type=SERVICE`
      );
      const result = await response.json();

      if (result.success) {
        const fetchedMessages = result.messages || [];

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
        setConversations(prev =>
          prev.map(conv =>
            conv.id === otherUserId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) setLoading(false);
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

  const handleSendMessage = async (customContent?: string, customAttachment?: any) => {
    // If customContent is provided (including empty string), use it. Otherwise use state.
    const content = customContent !== undefined ? customContent : messageInput.trim();

    // Must have either content or attachment
    if ((!content && !customAttachment) || !selectedConversation || !currentUser?.id) return;

    if (!customAttachment) setMessageInput("");
    setReplyingTo(null);
    setSendingMessage(true);

    // Optimistically add message
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUser.id,
      receiverId: selectedConversation,
      sender: currentUser,
      receiver: conversations.find(c => c.id === selectedConversation)?.otherUser || { id: selectedConversation, name: '' },
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      isMine: true,
      attachment: customAttachment,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        sender: { name: replyingTo.isMine ? 'You' : replyingTo.sender.name }
      } : undefined,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedConversation,
          content,
          type: 'SERVICE',
          attachment: customAttachment,
          replyToId: replyingTo?.id,
        })
      });

      const result = await response.json();

      if (result.success) {
        // Replace temp message with real one
        const newMessage = result.message || result.data;
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? newMessage : msg
        ));
        // Update last message in conversations
        setConversations(prev => prev.map(conv =>
          conv.id === selectedConversation
            ? {
              ...conv,
              lastMessage: customAttachment ? '📎 Attachment' : content,
              time: 'Just now'
            }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      // Only turn off loading if we weren't called from file upload (which handles its own loading state)
      // Actually, handleFileSelect also sets sendingMessage(true) before calling this.
      // But handleSendMessage logic assumes it controls sendingMessage.
      // Let's just always set it to false here, but we might need to coordinate.
      // Current implementation: handleFileSelect sets it to false in finally *after* await handleSendMessage
      // So this setSendingMessage(false) will happen first, then handleFileSelect will set it false again. Should be fine.
      setSendingMessage(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.service?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  if (loading && conversations.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="vendor" label="Loading messages..." />
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiPackage className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">Service Messages</h1>
          </div>
          <p className="text-gray-600">Communicate with customers about their service bookings</p>
        </div>
        <button
          onClick={() => fetchConversations(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
        >
          {loading ? (
            <LoadingSpinner size="sm" color="current" />
          ) : (
            <FiRefreshCw className="w-4 h-4" />
          )}
          Refresh
        </button>
      </div>

      {/* Messages Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex h-[calc(100%-80px)]">
        {/* Conversations List */}
        <div className={`w-full md:w-96 border-r border-gray-200 flex flex-col ${showMobileChat ? 'hidden md:flex' : ''}`}>
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
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  id={`conversation-${conversation.id}`}
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    setShowMobileChat(true);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedConversation === conversation.id ? "bg-emerald-50" : ""
                    } ${highlightedConversationId === conversation.id ? "animate-highlight" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                        {conversation.otherUser?.image ? (
                          <img
                            src={conversation.otherUser.image}
                            alt={conversation.otherUser?.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(conversation.otherUser?.name || 'U')
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conversation.otherUser?.name || 'Unknown'}
                        </h4>
                        <span className="text-xs text-gray-500">{conversation.time}</span>
                      </div>
                      {conversation.service && (
                        <p className="text-xs text-emerald-600 truncate flex items-center gap-1 mb-1">
                          <FiPackage className="w-3 h-3" />
                          {conversation.service.title}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {getLastMessageText(conversation.lastMessage)}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FiMessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No conversations yet</p>
                <p className="text-sm mt-1">Messages from customers will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {currentConversation ? (
          <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : ''}`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                    {currentConversation.otherUser?.image ? (
                      <img
                        src={currentConversation.otherUser.image}
                        alt={currentConversation.otherUser?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(currentConversation.otherUser?.name || 'U')
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {currentConversation.otherUser?.name || 'Unknown'}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {currentConversation.service?.title || 'Service inquiry'}
                      {currentConversation.order && (
                        <span className="text-emerald-600"> • {currentConversation.order.orderNumber}</span>
                      )}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiMoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length > 0 ? (
                <>
                  {messages.map((message) => {
                    // Parse attachment if exists
                    let attachment = null;
                    if (message.attachment) {
                      try {
                        attachment = typeof message.attachment === 'string'
                          ? JSON.parse(message.attachment)
                          : message.attachment;
                      } catch (e) {
                        console.error('Failed to parse attachment:', e);
                      }
                    }

                    const isTemp = message.id.startsWith('temp-');
                    const isImage = attachment && (attachment.type?.startsWith('image/') || attachment.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));

                    return (
                      <div
                        key={message.id}
                        id={`message-${message.id}`}
                        className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg relative group ${isImage ? 'p-0 overflow-hidden' : 'px-4 py-2.5'} ${message.isMine
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
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-inherit z-10"
                            >
                              <FiChevronDown className="w-4 h-4" />
                            </button>
                          )}

                          {/* Dropdown Menu */}
                          {activeMessageDropdown === message.id && (
                            <div
                              className={`absolute top-8 ${message.isMine ? 'right-0' : 'left-0'} w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50`}
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
                            <div className={`mb-2 p-2 rounded border-l-4 ${isImage ? 'mx-4 mt-2' : ''} ${message.isMine ? 'bg-black/5 border-emerald-500' : 'bg-gray-100 border-gray-400'} text-xs`}>
                              <p className="font-bold mb-0.5 text-emerald-700">{message.replyTo.sender?.name}</p>
                              <p className="truncate opacity-80">{message.replyTo.content}</p>
                            </div>
                          )}

                          {/* Attachment */}
                          {attachment && (
                            <div className={isImage ? "relative group" : "mb-2"}>
                              {isImage ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setPreviewImage({
                                        url: attachment.url,
                                        senderName: message.isMine ? 'You' : (currentConversation?.otherUser?.name || 'User'),
                                        senderImage: (message.isMine ? currentUser?.image : currentConversation?.otherUser?.image) ?? undefined,
                                        timestamp: message.timestamp
                                      });
                                      setScale(1);
                                    }}
                                    className="block w-full text-left focus:outline-none"
                                  >
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name || 'Image'}
                                      className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity block"
                                    />
                                  </button>
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/40 text-white backdrop-blur-[2px] flex items-center gap-1">
                                    <span>{message.timestamp}</span>
                                    {message.isMine && (
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
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-lg ${message.isMine ? 'bg-[#d1f2cc]' : 'bg-gray-100'
                                    }`}
                                >
                                  <FiPaperclip className="w-5 h-5 text-gray-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-gray-900">
                                      {attachment.name || 'File'}
                                    </p>
                                    {attachment.size && (
                                      <p className="text-xs text-gray-500">
                                        {formatFileSize(attachment.size)}
                                      </p>
                                    )}
                                  </div>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Message content and Timestamp logic */}
                          <div className={`relative ${isImage ? 'px-4 pb-2.5 pt-2' : ''}`}>
                            {message.content && (
                              <span className="text-sm whitespace-pre-wrap">{message.content}</span>
                            )}
                            {!isImage && (
                              <span className="float-right flex items-center gap-1 ml-2 mt-2 -mb-0.5">
                                <span className="text-[10px] text-gray-500">{message.timestamp}</span>
                                {message.isMine && (
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
                          </div>
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
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <FiMessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
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
                    <LoadingSpinner size="sm" color="vendor" />
                  ) : (
                    <FiPaperclip className="w-5 h-5" />
                  )}
                </button>
                <textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 resize-none h-9 overflow-hidden"
                ></textarea>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!messageInput.trim() || sendingMessage}
                  className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className={`w-5 h-5 ${sendingMessage ? 'animate-pulse' : ''}`} />
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
      {
        previewImage && (
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
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  {previewImage.senderImage ? (
                    <img src={previewImage.senderImage} alt={previewImage.senderName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                      {previewImage.senderName[0]}
                    </div>
                  )}
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
        )
      }
    </div >
  );
}

export default function VendorServiceMessages() {
  return (
    <Suspense fallback={
      <div className="p-6 h-[calc(100vh-64px)] flex items-center justify-center">
        <LoadingSpinner size="lg" color="vendor" label="Loading messages..." />
      </div>
    }>
      <VendorServiceMessagesContent />
    </Suspense>
  );
}
