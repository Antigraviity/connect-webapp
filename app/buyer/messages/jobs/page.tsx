"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FiMessageSquare,
  FiSearch,
  FiSend,
  FiPaperclip,
  FiUser,
  FiBriefcase,
  FiInbox,
  FiCheck,
  FiCheckCircle,
  FiX,
  FiDownload,
  FiFile,
  FiFileText,
  FiImage,
  FiLoader,
  FiArrowLeft,
  FiBell,
} from "react-icons/fi";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  userType: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  read: boolean;
  readAt: string | null;
  attachments: string | null;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Conversation {
  id: string;
  otherUser: User;
  lastMessage: {
    content: string;
    createdAt: string;
    read: boolean;
    senderId: string;
  } | null;
  unreadCount: number;
  isTyping: boolean;
  lastSeen: string | null;
  jobId: string | null;
  lastMessageAt: string;
}

interface SearchResult {
  messageId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  sender: User;
  otherParticipant: User;
}

export default function JobMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Get current user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      fetchConversations(user.id);
    } else {
      setLoading(false);
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation && currentUser) {
      fetchMessages(selectedConversation);
      
      // Poll for new messages every 3 seconds
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      
      pollingInterval.current = setInterval(() => {
        fetchMessages(selectedConversation, true);
        fetchConversations(currentUser.id, true);
      }, 3000);
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [selectedConversation, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Calculate total unread
  useEffect(() => {
    const total = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    setTotalUnread(total);
  }, [conversations]);

  const fetchConversations = async (userId: string, silent = false) => {
    try {
      const response = await fetch(`/api/job-messages/conversations?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        const oldUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
        const newUnread = data.conversations.reduce((sum: number, c: Conversation) => sum + c.unreadCount, 0);
        
        setConversations(data.conversations);
        
        // Show notification if new message arrived
        if (!silent && newUnread > oldUnread && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('New Message', {
            body: 'You have a new message in Job Messages',
            icon: '/favicon.ico',
          });
          
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {}); // Ignore errors if sound file doesn't exist
        }
        
        if (!silent) {
          console.log("✅ Fetched conversations:", data.conversations.length);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const fetchMessages = async (conversationId: string, silent = false) => {
    try {
      if (!currentUser) return;
      
      const response = await fetch(
        `/api/job-messages/${conversationId}?userId=${currentUser.id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        if (!silent) {
          console.log("✅ Fetched messages:", data.messages.length);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]) => {
    const uploadedFiles = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/job-messages/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (data.success) {
          uploadedFiles.push(data.file);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    return uploadedFiles;
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && selectedFiles.length === 0) || !selectedConversation || !currentUser || sending) return;

    setSending(true);
    setUploading(selectedFiles.length > 0);
    
    const tempMessage = messageInput;
    const tempFiles = [...selectedFiles];
    setMessageInput("");
    setSelectedFiles([]);

    try {
      // Upload files if any
      let attachments = null;
      if (tempFiles.length > 0) {
        const uploaded = await uploadFiles(tempFiles);
        attachments = uploaded;
      }

      const response = await fetch(`/api/job-messages/${selectedConversation}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: tempMessage || '📎 Attachment',
          attachments,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMessages(selectedConversation, true);
        await fetchConversations(currentUser.id, true);
        console.log("✅ Message sent");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageInput(tempMessage);
      setSelectedFiles(tempFiles);
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation || !currentUser) return;
    
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set new timeout to clear typing after 3 seconds
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 3000);
  };

  const updateTypingStatus = async (typing: boolean) => {
    if (!selectedConversation || !currentUser) return;
    
    try {
      await fetch(`/api/job-messages/${selectedConversation}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          action: 'typing',
          isTyping: typing,
        }),
      });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleSearch = async () => {
    if (!messageSearchQuery.trim() || !currentUser) return;

    try {
      const response = await fetch(
        `/api/job-messages/search?userId=${currentUser.id}&query=${encodeURIComponent(messageSearchQuery)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
        console.log("✅ Search results:", data.count);
      }
    } catch (error) {
      console.error("Error searching messages:", error);
    }
  };

  const jumpToMessage = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowSearch(false);
    setMessageSearchQuery("");
    setSearchResults([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOnlineStatus = (lastSeen: string | null) => {
    if (!lastSeen) return 'Offline';
    const diff = new Date().getTime() - new Date(lastSeen).getTime();
    if (diff < 300000) return 'Online'; // 5 minutes
    if (diff < 3600000) return `Active ${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `Active ${Math.floor(diff / 3600000)}h ago`;
    return `Active ${Math.floor(diff / 86400000)}d ago`;
  };

  const parseAttachments = (attachments: string | null) => {
    if (!attachments) return [];
    try {
      return JSON.parse(attachments);
    } catch {
      return [];
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FiImage className="w-5 h-5" />;
    if (type.includes('pdf')) return <FiFileText className="w-5 h-5" />;
    return <FiFile className="w-5 h-5" />;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Log In</h3>
          <p className="text-gray-600 mb-4">You need to be logged in to view messages</p>
          <Link
            href="/signin"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiBriefcase className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Job Messages</h1>
            {totalUnread > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {totalUnread}
              </span>
            )}
          </div>
          <p className="text-gray-600">Communicate with employers and recruiters</p>
        </div>
        
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiSearch className="w-4 h-4" />
          Search Messages
        </button>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowSearch(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={messageSearchQuery}
                onChange={(e) => setMessageSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search messages..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Search
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.messageId}
                  onClick={() => jumpToMessage(result.conversationId)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {result.otherParticipant.image ? (
                        <img
                          src={result.otherParticipant.image}
                          alt={result.otherParticipant.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {result.otherParticipant.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(result.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{result.content}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {messageSearchQuery && searchResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No messages found for "{messageSearchQuery}"
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
                  {conversations.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Search */}
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

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiInbox className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    When you apply for jobs or employers reach out to you, your conversations will appear here.
                  </p>
                  <Link
                    href="/buyer/jobs"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    <FiBriefcase className="w-4 h-4" />
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            {conversation.otherUser.image ? (
                              <img
                                src={conversation.otherUser.image}
                                alt={conversation.otherUser.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <FiUser className="w-6 h-6 text-white" />
                            )}
                          </div>
                          {getOnlineStatus(conversation.lastSeen) === 'Online' && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {conversation.otherUser.name}
                              </h4>
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.otherUser.userType === 'EMPLOYER' ? 'Employer' : 'User'}
                              </p>
                            </div>
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            {conversation.isTyping ? (
                              <p className="text-sm text-blue-600 italic">Typing...</p>
                            ) : conversation.lastMessage ? (
                              <p className="text-sm text-gray-600 truncate flex-1">
                                {conversation.lastMessage.senderId === currentUser.id && 'You: '}
                                {conversation.lastMessage.content}
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
          {currentConversation ? (
            <div className="flex-1 flex flex-col hidden md:flex">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        {currentConversation.otherUser.image ? (
                          <img
                            src={currentConversation.otherUser.image}
                            alt={currentConversation.otherUser.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-5 h-5 text-white" />
                        )}
                      </div>
                      {getOnlineStatus(currentConversation.lastSeen) === 'Online' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {currentConversation.otherUser.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {currentConversation.isTyping ? (
                          <span className="text-blue-600">Typing...</span>
                        ) : (
                          getOnlineStatus(currentConversation.lastSeen)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => {
                  const isMe = message.senderId === currentUser?.id;
                  const attachments = parseAttachments(message.attachments);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%]`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 shadow-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          
                          {/* Attachments */}
                          {attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {attachments.map((file: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-3 rounded-lg ${
                                    isMe ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-100 hover:bg-gray-200'
                                  } transition-colors`}
                                >
                                  {getFileIcon(file.type)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{file.name}</p>
                                    <p className="text-xs opacity-75">{formatFileSize(file.size)}</p>
                                  </div>
                                  <FiDownload className="w-4 h-4" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={isMe ? 'text-gray-500' : 'text-gray-500'}>
                            {formatTime(message.createdAt)}
                          </span>
                          {isMe && (
                            message.read ? (
                              <FiCheckCircle className="w-3 h-3 text-blue-600" />
                            ) : (
                              <FiCheck className="w-3 h-3 text-gray-400" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200"
                      >
                        {getFileIcon(file.type)}
                        <span className="text-sm text-gray-700 max-w-[150px] truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <FiX className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <FiLoader className="w-5 h-5 text-gray-600 animate-spin" />
                    ) : (
                      <FiPaperclip className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      disabled={sending}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && selectedFiles.length === 0) || sending}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <FiLoader className="w-5 h-5 animate-spin" />
                    ) : (
                      <FiSend className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md px-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageSquare className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Connecting with Employers</h3>
                <p className="text-gray-600 mb-6">
                  Select a conversation from the list to start messaging, or apply for jobs to begin conversations with employers.
                </p>
                <Link
                  href="/buyer/jobs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <FiBriefcase className="w-5 h-5" />
                  Find Jobs
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Badge Info */}
      {totalUnread > 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FiBell className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              <strong>{totalUnread}</strong> unread message{totalUnread !== 1 ? 's' : ''} • 
              Desktop notifications are {Notification.permission === 'granted' ? 'enabled' : 'disabled'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
