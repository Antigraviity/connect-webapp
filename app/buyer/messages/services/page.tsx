"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  FiMessageSquare,
  FiSearch,
  FiSend,
  FiPaperclip,
  FiMoreVertical,
  FiUser,
  FiFilter,
  FiPackage,
  FiLoader,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiImage,
  FiFile,
  FiDownload,
} from "react-icons/fi";
import { useAuth } from "@/lib/useAuth";

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface Message {
  id: string;
  content: string;
  attachment?: string | null;
  read: boolean;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
  receiver: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    userType?: string;
    role?: string;
  };
  lastMessage: {
    content: string;
    attachment?: string | null;
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

export default function ServicesMessagesPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-select provider from URL params
  useEffect(() => {
    const providerId = searchParams.get('provider');
    if (providerId) {
      setSelectedConversation(providerId);
    }
  }, [searchParams]);

  // Fetch conversations on mount
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (user?.id && selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [user, selectedConversation]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!user?.id || !selectedConversation) return;

    const interval = setInterval(() => {
      fetchMessages(selectedConversation, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [user, selectedConversation]);

  // Poll for new conversations every 10 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchConversations(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async (silent = false) => {
    if (!silent) setLoadingConversations(true);

    try {
      const response = await fetch(`/api/messages?userId=${user?.id}&conversationList=true&type=SERVICE`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations || []);

        const providerId = searchParams.get('provider');
        if (providerId && !data.conversations.find((c: Conversation) => c.id === providerId)) {
          const providerResponse = await fetch(`/api/users/${providerId}`);
          const providerData = await providerResponse.json();

          if (providerData.success && providerData.user) {
            const newConversation: Conversation = {
              id: providerId,
              user: providerData.user,
              lastMessage: null,
              unreadCount: 0,
              relatedBooking: null,
            };
            setConversations(prev => [newConversation, ...prev]);
          }
        }
      } else {
        if (!silent) setError(data.message || 'Failed to fetch conversations');
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
      if (!silent) setError('An error occurred while loading conversations');
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  const fetchMessages = async (otherUserId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);

    try {
      const response = await fetch(`/api/messages?userId=${user?.id}&otherUserId=${otherUserId}&type=SERVICE`);
      const data = await response.json();

      if (data.success) {
        const newMessages = data.messages || [];
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages);
        }

        setConversations(prev => prev.map(conv =>
          conv.id === otherUserId ? { ...conv, unreadCount: 0 } : conv
        ));
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<Attachment | null> => {
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Send as JSON with base64
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return data.file;
      } else {
        alert(data.message || 'Failed to upload file');
        return null;
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload file');
      return null;
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedFile) || !selectedConversation || !user?.id) return;

    const content = messageInput.trim();
    setMessageInput("");
    setSendingMessage(true);

    let attachment: Attachment | null = null;

    // Upload file if selected
    if (selectedFile) {
      setUploadingFile(true);
      attachment = await uploadFile(selectedFile);
      setUploadingFile(false);

      if (!attachment && !content) {
        setSendingMessage(false);
        return;
      }

      clearSelectedFile();
    }

    // Optimistically add message to UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      attachment: attachment ? JSON.stringify(attachment) : null,
      read: false,
      senderId: user.id,
      receiverId: selectedConversation,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name || 'You', image: user.image },
      receiver: { id: selectedConversation, name: '', image: undefined },
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedConversation,
          content,
          attachment,
          type: 'SERVICE',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => prev.map(m =>
          m.id === tempMessage.id ? data.data : m
        ));

        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.id === selectedConversation) {
              return {
                ...conv,
                lastMessage: {
                  content: content || (attachment ? '📎 Attachment' : ''),
                  attachment: attachment ? JSON.stringify(attachment) : null,
                  createdAt: new Date().toISOString(),
                  isFromMe: true,
                },
              };
            }
            return conv;
          });
          const convIndex = updated.findIndex(c => c.id === selectedConversation);
          if (convIndex > 0) {
            const [conv] = updated.splice(convIndex, 1);
            updated.unshift(conv);
          }
          return updated;
        });
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      alert('An error occurred while sending the message');
    } finally {
      setSendingMessage(false);
    }
  };

  const parseAttachment = (attachmentStr: string | null | undefined): Attachment | null => {
    if (!attachmentStr) return null;
    try {
      return JSON.parse(attachmentStr);
    } catch {
      return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.relatedBooking?.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your messages</p>
          <a
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiPackage className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Service Messages</h1>
          </div>
          <button
            onClick={() => fetchConversations()}
            disabled={loadingConversations}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${loadingConversations ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <p className="text-gray-600 mt-1">Communicate with service providers about your bookings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
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
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiFilter className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search service conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="p-8 text-center">
                  <FiLoader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No conversations yet</p>
                  <p className="text-sm text-gray-500 mt-1">Start a conversation from your bookings</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                    >
                      <div className="flex items-start gap-3">
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
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {conversation.user?.name || 'Unknown User'}
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
                            <p className="text-sm text-gray-600 truncate flex-1">
                              {conversation.lastMessage?.isFromMe && (
                                <span className="text-gray-400">You: </span>
                              )}
                              {conversation.lastMessage?.attachment ? '📎 Attachment' :
                                conversation.lastMessage?.content || 'No messages yet'}
                            </p>
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
          {selectedConversation && currentConversation ? (
            <div className="flex-1 flex flex-col hidden md:flex">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        {currentConversation.user?.image ? (
                          <img
                            src={currentConversation.user.image}
                            alt={currentConversation.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {currentConversation.user?.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {currentConversation.user?.userType === 'SELLER' ? 'Service Provider' :
                          currentConversation.user?.role === 'SELLER' ? 'Service Provider' : 'User'}
                        {currentConversation.relatedBooking && (
                          <span className="text-blue-600"> • {currentConversation.relatedBooking.serviceName}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentConversation.relatedBooking && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {currentConversation.relatedBooking.orderNumber}
                      </span>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <FiMoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FiMessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-600">No messages yet</p>
                    <p className="text-sm text-gray-500">Send a message to start the conversation</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isFromMe = message.senderId === user?.id;
                      const attachment = parseAttachment(message.attachment);

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${isFromMe
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 shadow-sm'
                              }`}
                          >
                            {/* Attachment */}
                            {attachment && (
                              <div className="mb-2">
                                {attachment.type.startsWith('image/') ? (
                                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name}
                                      className="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 p-2 rounded-lg ${isFromMe ? 'bg-blue-500' : 'bg-gray-100'
                                      }`}
                                  >
                                    <FiFile className={`w-8 h-8 ${isFromMe ? 'text-blue-200' : 'text-gray-500'}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium truncate ${isFromMe ? 'text-white' : 'text-gray-900'}`}>
                                        {attachment.name}
                                      </p>
                                      <p className={`text-xs ${isFromMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {formatFileSize(attachment.size)}
                                      </p>
                                    </div>
                                    <FiDownload className={`w-4 h-4 ${isFromMe ? 'text-blue-200' : 'text-gray-500'}`} />
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Message content */}
                            {message.content && (
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}

                            <div className={`flex items-center justify-end gap-1 mt-1`}>
                              <p
                                className={`text-xs ${isFromMe ? 'text-blue-100' : 'text-gray-500'
                                  }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                              {isFromMe && (
                                <FiCheck className={`w-3 h-3 ${message.read ? 'text-blue-200' : 'text-blue-300'}`} />
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

              {/* File Preview */}
              {selectedFile && (
                <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <FiFile className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      onClick={clearSelectedFile}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <FiX className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendingMessage || uploadingFile}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Attach file"
                  >
                    {uploadingFile ? (
                      <FiLoader className="w-5 h-5 text-gray-600 animate-spin" />
                    ) : (
                      <FiPaperclip className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none resize-none"
                      disabled={sendingMessage}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && !selectedFile) || sendingMessage}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? (
                      <FiLoader className="w-5 h-5 animate-spin" />
                    ) : (
                      <FiSend className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  📎 Attach images, PDF, Word, Excel, or text files (max 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
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
  );
}
