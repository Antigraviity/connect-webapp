"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import {
  FiMessageSquare,
  FiSend,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiUser,
  FiCheck,
  FiCheckCircle,
  FiPaperclip,
  FiImage,
  FiX,
  FiRefreshCw,
  FiArrowLeft,
  FiMoreVertical,
  FiPackage,
  FiChevronDown,
  FiCornerUpLeft,
  FiCopy,
  FiSmile,
  FiTrash2,
} from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    userType: string | null;
    role: string;
  };
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

interface User {
  id: string;
  name: string;
  image: string | null;
}

interface Message {
  id: string;
  content: string;
  attachment: string | null;
  read: boolean;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: User;
  receiver: User;
  timestamp: string;
  isMine: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender: { name: string };
  };
  reactions?: string[];
}

export default function MessagesPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [activeMessageDropdown, setActiveMessageDropdown] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Fetch conversations when user is available
  useEffect(() => {
    if (currentUser?.id) {
      fetchConversations(true);
    }
  }, [currentUser?.id]);

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

  // Set loading to false if not authenticated and auth loading is done
  useEffect(() => {
    if (!currentUser?.id && !authLoading) {
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (selectedConversation && currentUser?.id) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id, true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, currentUser?.id]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (!messagesEndRef.current) return;

    messagesEndRef.current.scrollIntoView({ behavior });

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 500);
  };

  const fetchConversations = async (forceSelectLatest = false) => {
    if (!currentUser?.id) return;

    if (forceSelectLatest) setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/messages?userId=${currentUser.id}&conversationList=true`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations || []);

        const chatId = searchParams.get('chat');
        if ((!selectedConversation || forceSelectLatest) && data.conversations?.length > 0) {
          const targetId = (forceSelectLatest ? null : searchParams.get('chat'));
          const targetConv = (targetId ? data.conversations.find((c: Conversation) => c.id === targetId) : null) || data.conversations[0];

          if (selectedConversation?.id === targetConv.id && forceSelectLatest) {
            fetchMessages(targetConv.id);
          } else {
            setSelectedConversation(targetConv);
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

  const fetchMessages = async (otherUserId: string, silent = false) => {
    if (!currentUser?.id) return;

    if (!silent) {
      setMessagesLoading(true);
    }

    try {
      const response = await fetch(`/api/messages?userId=${currentUser.id}&otherUserId=${otherUserId}`);
      const data = await response.json();

      if (data.success) {
        const fetchedMessages: Message[] = data.messages.map((msg: any) => ({
          ...msg,
          isMine: msg.senderId === currentUser.id,
          timestamp: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        }));

        setMessages(prev => {
          const optimistic = prev.filter(m => m.id.startsWith('temp-'));
          const currentNonOptimistic = prev.filter(m => !m.id.startsWith('temp-'));

          if (silent && JSON.stringify(fetchedMessages) === JSON.stringify(currentNonOptimistic)) {
            return prev;
          }

          return [...fetchedMessages, ...optimistic];
        });
        // Update unread count in conversation list
        setConversations(prev =>
          prev.map(conv =>
            conv.id === otherUserId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      if (!silent) {
        setMessagesLoading(false);
      }
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    setShowMobileChat(true);
    setReplyingTo(null); // Clear any pending reply
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation || !currentUser?.id || sending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setReplyingTo(null);
    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedConversation.id,
          content,
          replyToId: replyingTo?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newMessageData: Message = {
          ...data.data,
          isMine: true,
          timestamp: new Date(data.data.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          replyTo: replyingTo ? {
            id: replyingTo.id,
            content: replyingTo.content,
            sender: { name: replyingTo.isMine ? 'You' : replyingTo.sender.name }
          } : undefined,
        };
        setMessages(prev => [...prev, newMessageData]);

        // Update last message in conversation list
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? {
                ...conv,
                lastMessage: {
                  content: content,
                  attachment: null,
                  createdAt: new Date().toISOString(),
                  isFromMe: true
                }
              }
              : conv
          )
        );
      } else {
        alert(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
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
      return date.toLocaleDateString('en-US', { weekday: 'short' });
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

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
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
          <FiLoader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">You need to be signed in to view your messages.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
            onClick={() => fetchConversations(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              {totalUnread > 0 && ` • ${totalUnread} unread`}
            </p>
          </div>
          <button
            onClick={() => fetchConversations(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {searchQuery ? "No conversations match your search" : "No conversations yet"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                    }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      {conv.user?.image ? (
                        <img
                          src={conv.user.image}
                          alt={conv.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {conv.user?.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conv.user?.name || 'Unknown User'}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {conv.relatedBooking && (
                      <p className="text-xs text-primary-600 truncate mb-1">
                        <FiPackage className="w-3 h-3 inline mr-1" />
                        {conv.relatedBooking.serviceName}
                      </p>
                    )}

                    {conv.lastMessage && (
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {conv.lastMessage.isFromMe && <span className="text-gray-400">You: </span>}
                        {conv.lastMessage.content || '[Attachment]'}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {selectedConversation.user?.image ? (
                    <img
                      src={selectedConversation.user.image}
                      alt={selectedConversation.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {selectedConversation.user?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {selectedConversation.user?.name || 'Unknown User'}
                  </h3>
                  {selectedConversation.relatedBooking && (
                    <p className="text-xs text-primary-600 truncate">
                      Order: {selectedConversation.relatedBooking.orderNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <FiLoader className="w-8 h-8 text-primary-600 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isMe = message.senderId === currentUser.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] relative ${isMe ? 'order-1' : ''}`}>
                            <div
                              className={`rounded-lg relative group pl-3 pr-2 pt-1.5 pb-1 ${isMe
                                ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                                : 'bg-white text-gray-900 rounded-tl-none shadow-sm'
                                }`}
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
                                    {formatTime(message.createdAt)}
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
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
