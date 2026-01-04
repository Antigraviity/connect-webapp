"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FiMessageSquare, FiSearch, FiSend, FiPaperclip, FiMoreVertical, FiUser, FiFilter, FiPackage, FiLoader, FiRefreshCw, FiX, FiImage, FiFile, FiDownload, FiZoomIn, FiZoomOut, FiArrowLeft, FiChevronDown, FiCornerUpLeft, FiCopy, FiSmile, FiTrash2 } from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { useAuth } from "@/lib/useAuth";
import { Suspense } from "react";

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
  isUploading?: boolean;
}

interface User {
  id: string;
  name: string;
  image?: string;
  userType?: string;
  role?: string;
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
  isMine: boolean;
  attachment?: Attachment | Attachment[] | null;
  replyTo?: {
    id: string;
    content: string;
    sender: { name: string };
  };
  reactions?: string[];
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
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    }>
      <ServicesMessagesContent />
    </Suspense>
  );
}

function ServicesMessagesContent() {
  const { user } = useAuth();
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [highlightedConversationId, setHighlightedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMessageDropdown, setActiveMessageDropdown] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState<{ url: string; senderName: string; senderImage?: string; timestamp: string } | null>(null);
  const [scale, setScale] = useState(1);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ url: string; file: File }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const initialOtherUserId = searchParams.get('chat') || searchParams.get('provider') || searchParams.get('conversationWith');
  const initialMessageId = searchParams.get('messageId');
  const prevMessagesCount = useRef(0);
  const isInitialLoad = useRef(true);
  const lastHighlightedId = useRef<string | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-select provider from URL params
  useEffect(() => {
    if (initialOtherUserId) {
      setSelectedConversation(initialOtherUserId);
    }
  }, [initialOtherUserId]);

  // Fetch conversations on mount
  useEffect(() => {
    if (user?.id) {
      fetchConversations(false, true);
    }
  }, [user]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (user?.id && selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [user, selectedConversation]);

  // Poll for new messages every  // Refresh polling
  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      fetchMessages(selectedConversation, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

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

  // Poll for new conversations every 10 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchConversations(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle message highlighting from URL
  useEffect(() => {
    // 1. Handle sidebar highlight
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
  }, [messages, initialMessageId, initialOtherUserId, conversations]);

  // Scroll to bottom when messages change (STRICTER CONTROL)
  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesCount.current;

    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      const sentByMe = lastMessage?.senderId === user?.id;

      // Get scroll container
      const container = messagesEndRef.current?.parentElement;
      const isAtBottom = container
        ? container.scrollHeight - container.scrollTop <= container.clientHeight + 150
        : true;

      // ONLY scroll if: first load, I sent it, or user is already at bottom
      // AND NOT when we are deep-linking to a specific message
      if (!initialMessageId && (isInitialLoad.current || sentByMe || isAtBottom)) {
        scrollToBottom();
      }

      if (isInitialLoad.current && messages.length > 0) {
        isInitialLoad.current = false;
      }
    }

    prevMessagesCount.current = messages.length;
  }, [messages, user?.id, initialMessageId]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
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

  const fetchConversations = async (silent = false, forceSelectLatest = false) => {
    if (!silent) setLoadingConversations(true);

    try {
      const response = await fetch(`/api/messages?userId=${user?.id}&conversationList=true&type=SERVICE`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations || []);

        // Check for both 'chat' and 'provider' parameters
        const chatId = searchParams.get('chat') || searchParams.get('provider');
        if (chatId && !data.conversations.find((c: Conversation) => c.id === chatId)) {
          const providerResponse = await fetch(`/api/users/${chatId}`);
          const providerData = await providerResponse.json();

          if (providerData.success && providerData.user) {
            const newConversation: Conversation = {
              id: chatId,
              user: providerData.user,
              lastMessage: null,
              unreadCount: 0,
              relatedBooking: null,
            };
            setConversations(prev => [newConversation, ...prev]);
            if (!silent || forceSelectLatest) {
              setSelectedConversation(chatId);
            }
          }
        } else if ((!selectedConversation || forceSelectLatest) && data.conversations.length > 0) {
          // Priority to URL ONLY if not forcing latest
          const targetId = (forceSelectLatest ? null : (searchParams.get('chat') || searchParams.get('provider'))) || data.conversations[0].id;

          if (selectedConversation === targetId && forceSelectLatest) {
            // Already selected, but force update messages
            fetchMessages(targetId);
          } else {
            setSelectedConversation(targetId);
          }
        }
      } else {
        if (!silent) setError(data.message || 'Failed to fetch conversations');
      }
    } catch (err) {
      if (!silent) {
        console.error('Fetch conversations error:', err);
        setError('An error occurred while loading conversations');
      } else {
        console.warn('Background conversations fetch warning:', err);
      }
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

        setMessages(prev => {
          // Identify optimistic messages
          const optimistic = prev.filter(m => m.id.startsWith('temp-'));

          // If we are in a background poll and nothing changed (other than ordering or internal fields we don't care about here),
          // avoid a state update to prevent flashes.
          const currentNonOptimistic = prev.filter(m => !m.id.startsWith('temp-'));
          if (silent && JSON.stringify(newMessages) === JSON.stringify(currentNonOptimistic)) {
            return prev;
          }

          // Combine new messages from server with our local optimistic ones
          return [...newMessages, ...optimistic];
        });

        if (!silent) {
          setTimeout(() => scrollToBottom("instant"), 50);
        }

        setConversations(prev => prev.map(conv =>
          conv.id === otherUserId ? { ...conv, unreadCount: 0 } : conv
        ));
      }
    } catch (err) {
      if (!silent) {
        console.error('Fetch messages error:', err);
      } else {
        // Suppress error overlay for background polling
        console.warn('Background fetch warning:', err);
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };



  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if total files will exceed limit
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 10) {
      alert('You can only upload up to 10 files at once.');
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: { url: string; file: File }[] = [];

    files.forEach(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 10MB limit`);
        return;
      }
      newFiles.push(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews(prev => [...prev, { url: e.target?.result as string, file }]);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviews(prev => [...prev, { url: '', file }]);
      }
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
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

  const handleSendMessage = async (customAttachment: Attachment | null = null) => {
    // Must have either content or attachment
    if ((!messageInput.trim() && selectedFiles.length === 0 && !customAttachment) || !selectedConversation || !user?.id) return;

    const content = messageInput.trim();
    const currentFiles = [...selectedFiles];
    const currentPreviews = [...filePreviews];

    // Clear input immediately for better UX
    setMessageInput("");
    setReplyingTo(null);
    clearSelectedFiles();
    setSendingMessage(true);

    const tempId = `temp-${Date.now()}`;

    // Create optimistic attachments with local URLs
    let initialAttachments: Attachment[] = customAttachment ? [customAttachment] : currentPreviews.map(p => ({
      url: p.url,
      name: p.file.name,
      type: p.file.type,
      size: p.file.size,
      isUploading: true
    }));

    // Optimistically add message to UI
    const tempMessage: Message = {
      id: tempId,
      content,
      attachment: initialAttachments.length === 1 ? initialAttachments[0] : initialAttachments.length > 1 ? initialAttachments : null,
      read: false,
      senderId: user.id,
      receiverId: selectedConversation,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name || 'You', image: user.image },
      receiver: { id: selectedConversation, name: '', image: undefined },
      isMine: true,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        sender: { name: replyingTo.isMine ? 'You' : replyingTo.sender.name }
      } : undefined,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      let finalAttachments: Attachment[] = customAttachment ? [customAttachment] : [];

      // Upload files if selected
      if (currentFiles.length > 0) {
        setUploadingFile(true);
        for (let i = 0; i < currentFiles.length; i++) {
          const file = currentFiles[i];
          const uploaded = await uploadFile(file);
          if (uploaded) {
            finalAttachments.push(uploaded);

            // Update individual attachment status in UI
            setMessages(prev => prev.map(m => {
              if (m.id === tempId) {
                const updatedAttachments = initialAttachments.map((at, idx) =>
                  idx === i ? { ...uploaded, isUploading: false } : at
                );
                return {
                  ...m,
                  attachment: updatedAttachments.length === 1 ? updatedAttachments[0] : updatedAttachments
                };
              }
              return m;
            }));
          }
        }
        setUploadingFile(false);

        if (finalAttachments.length === 0 && !content) {
          setMessages(prev => prev.filter(m => m.id !== tempId));
          setSendingMessage(false);
          return;
        }
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedConversation,
          content,
          type: 'SERVICE',
          attachment: finalAttachments.length === 1 ? finalAttachments[0] : finalAttachments.length > 1 ? finalAttachments : null,
          replyToId: replyingTo?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => prev.map(m =>
          m.id === tempId ? data.data : m
        ));

        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.id === selectedConversation) {
              const displayAttachment = finalAttachments.length > 0 ? (finalAttachments.length === 1 ? '📎 Attachment' : `📎 ${finalAttachments.length} Attachments`) : null;
              return {
                ...conv,
                lastMessage: {
                  content: content || displayAttachment || '',
                  attachment: finalAttachments.length > 0 ? JSON.stringify(finalAttachments) : null,
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
        setMessages(prev => prev.filter(m => m.id !== tempId));
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('An error occurred while sending the message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    // Optimistic UI update
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        // For simplicity, we just add the emoji
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
        // On failure, we could potentially rollback, but for now we'll just log
      } else {
        // Sync with server reactions if needed
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, reactions: data.reactions } : msg
        ));
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
    setActiveMessageDropdown(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const parseAttachment = (attachment: any): Attachment | Attachment[] | null => {
    if (!attachment) return null;
    if (typeof attachment === 'object') return attachment;
    if (typeof attachment === 'string') {
      try {
        const parsed = JSON.parse(attachment);
        return parsed;
      } catch {
        // If it's not JSON, might be a legacy URL or something
        return null;
      }
    }
    return null;
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
            onClick={() => fetchConversations(false, true)}
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
                      id={`conversation-${conversation.id}`}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        } ${highlightedConversationId === conversation.id ? "animate-highlight" : ""}`}
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
                              <span className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                {(() => {
                                  if (conversation.lastMessage?.content) return conversation.lastMessage.content;
                                  if (conversation.lastMessage?.attachment) {
                                    try {
                                      const at = typeof conversation.lastMessage.attachment === 'string' ? JSON.parse(conversation.lastMessage.attachment) : conversation.lastMessage.attachment;
                                      if (Array.isArray(at)) return `📎 ${at.length} Attachments`;
                                      return '📎 Attachment';
                                    } catch {
                                      return '📎 Attachment';
                                    }
                                  }
                                  return 'No messages yet';
                                })()}
                              </span>
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
                    {messages.map((message, index) => {
                      const isMe = message.isMine;
                      const attachmentRaw = parseAttachment(message.attachment);
                      const attachments = Array.isArray(attachmentRaw) ? attachmentRaw : (attachmentRaw ? [attachmentRaw] : []);
                      const isImage = attachments.length > 0 && attachments.every(at => at.type?.startsWith('image/') || at.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));
                      const hasImages = attachments.some(at => at.type?.startsWith('image/') || at.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));
                      const messageTimestamp = formatTime(message.createdAt);

                      return (
                        <div
                          key={message.id}
                          id={`message-${message.id}`}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`rounded-2xl relative group ${isImage ? 'p-0 overflow-hidden' : 'px-4 py-2.5 shadow-sm'} ${isMe
                                ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none shadow-sm'
                                } ${highlightedMessageId === message.id ? "animate-highlight" : ""}`}
                            >
                              {/* Dropdown Trigger */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMessageDropdown(activeMessageDropdown === message.id ? null : message.id);
                                }}
                                className={`absolute top-1 right-1 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isImage ? 'bg-white/90 shadow-sm hover:text-gray-600' : 'bg-inherit'}`}
                              >
                                <FiChevronDown className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {activeMessageDropdown === message.id && (
                                <div
                                  className={`absolute ${index > messages.length - 3 ? 'bottom-8' : 'top-8'} ${isMe ? 'right-0' : 'left-0'} w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50`}
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
                                <div className={`mb-2 p-2 rounded border-l-4 ${isImage ? 'mx-4 mt-2' : ''} ${isMe ? 'bg-white/10 border-white/40' : 'bg-gray-100 border-gray-300'} text-xs`}>
                                  <p className={`font-bold mb-0.5 ${isMe ? 'text-white/90' : 'text-primary-700'}`}>{message.replyTo.sender?.name}</p>
                                  <p className={`truncate ${isMe ? 'text-white/70' : 'text-gray-600'}`}>{message.replyTo.content}</p>
                                </div>
                              )}

                              {/* Attachments */}
                              {attachments.length > 0 && (
                                <div className={isImage ? "relative group" : "mb-2 space-y-2"}>
                                  {isImage ? (
                                    <div className={`grid gap-1 ${attachments.length === 1 ? 'grid-cols-1' :
                                      attachments.length === 2 ? 'grid-cols-2' :
                                        'grid-cols-2'
                                      }`}>
                                      {attachments.slice(0, 4).map((at, idx) => {
                                        const isLastExtra = idx === 3 && attachments.length > 4;
                                        return (
                                          <div key={idx} className="relative overflow-hidden group/img aspect-square sm:aspect-auto">
                                            <button
                                              onClick={() => {
                                                setPreviewImage({
                                                  url: at.url,
                                                  senderName: isMe ? 'You' : message.sender.name,
                                                  senderImage: isMe ? user?.image : message.sender.image,
                                                  timestamp: messageTimestamp
                                                });
                                                setScale(1);
                                              }}
                                              className="block w-full h-full text-left focus:outline-none"
                                            >
                                              <div className="relative h-full">
                                                <img
                                                  src={at.url}
                                                  alt={at.name || 'Image'}
                                                  className={`w-full ${attachments.length > 1 ? 'h-32' : 'max-h-64'} object-cover cursor-pointer hover:opacity-95 transition-all block ${at.isUploading ? 'blur-[2px] brightness-75' : ''}`}
                                                />
                                                {at.isUploading && (
                                                  <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                  </div>
                                                )}
                                                {isLastExtra && (
                                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                                                    <span className="text-white text-xl font-bold">+{attachments.length - 3}</span>
                                                  </div>
                                                )}
                                              </div>
                                            </button>
                                            {(idx === attachments.length - 1 || idx === 3) && (
                                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/40 text-white backdrop-blur-[2px] flex items-center gap-1">
                                                <span>{messageTimestamp}</span>
                                                {isMe && (
                                                  message.id.startsWith('temp-') ? (
                                                    <BsCheck className="w-3 h-3 text-white" />
                                                  ) : message.read ? (
                                                    <BsCheckAll className="w-3 h-3 text-blue-400" />
                                                  ) : (
                                                    <BsCheckAll className="w-3 h-3 text-white" />
                                                  )
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    attachments.map((at, idx) => {
                                      const isAtImage = at.type?.startsWith('image/') || at.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                      if (isAtImage) {
                                        return (
                                          <div key={idx} className="relative rounded-lg overflow-hidden max-w-sm">
                                            <button
                                              onClick={() => {
                                                setPreviewImage({
                                                  url: at.url,
                                                  senderName: isMe ? 'You' : message.sender.name,
                                                  senderImage: isMe ? user?.image : message.sender.image,
                                                  timestamp: messageTimestamp
                                                });
                                                setScale(1);
                                              }}
                                            >
                                              <img
                                                src={at.url}
                                                alt={at.name || 'Image'}
                                                className="max-w-full max-h-48 object-cover rounded-lg"
                                              />
                                            </button>
                                          </div>
                                        );
                                      }
                                      return (
                                        <a
                                          key={idx}
                                          href={at.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-white/10 border border-white/10' : 'bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                          <FiPaperclip className={`w-5 h-5 ${isMe ? 'text-white/70' : 'text-gray-500'}`} />
                                          <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isMe ? 'text-white' : 'text-gray-900'}`}>
                                              {at.name || 'File'}
                                            </p>
                                            <p className={`text-xs ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                                              {formatFileSize(at.size)}
                                            </p>
                                          </div>
                                          <FiDownload className={`w-4 h-4 ${isMe ? 'text-white/70' : 'text-gray-500'}`} />
                                        </a>
                                      );
                                    })
                                  )}
                                </div>
                              )}

                              {/* Message content and Timestamp logic */}
                              <div className={`relative ${isImage ? 'px-4 pb-2.5 pt-2' : ''}`}>
                                {message.content && (
                                  <span className="text-sm whitespace-pre-wrap break-words">{message.content}</span>
                                )}
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

                            {/* Timestamp and ticks below the bubble */}
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[10px] text-gray-400 font-medium tracking-tight">{messageTimestamp}</span>
                              {isMe && (
                                message.id.startsWith('temp-') ? (
                                  <BsCheck className="w-4 h-4 text-gray-400" />
                                ) : message.read ? (
                                  <BsCheckAll className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <BsCheckAll className="w-4 h-4 text-gray-400" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )
                }
              </div>

              {/* File Preview */}
              {selectedFiles.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={clearSelectedFiles}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-3 pt-2 scrollbar-hide">
                    {filePreviews.map((preview, idx) => (
                      <div key={idx} className="relative flex-shrink-0 w-20 h-20 group">
                        {preview.url ? (
                          <img src={preview.url} alt="Preview" className="w-full h-full rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200 p-1">
                            <FiFile className="w-6 h-6 text-gray-400 mb-1" />
                            <p className="text-[10px] text-gray-500 truncate w-full text-center px-1">
                              {preview.file.name.split('.').pop()?.toUpperCase()}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendingMessage || uploadingFile}
                    className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 -translate-y-1"
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
                      ref={textareaRef}
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
                      className="w-full h-10 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none resize-none leading-relaxed"
                      disabled={sendingMessage}
                    />
                  </div>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={(!messageInput.trim() && selectedFiles.length === 0) || sendingMessage}
                    className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed -translate-y-1"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conversation Selected</h3>
                <p className="text-gray-600">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
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
                  {previewImage?.senderImage ? (
                    <img src={previewImage.senderImage} alt={previewImage.senderName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                      {previewImage?.senderName?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-white font-medium">{previewImage?.senderName}</div>
                  <div className="text-gray-400 text-xs">{previewImage?.timestamp}</div>
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
                  href={previewImage?.url}
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
                src={previewImage?.url}
                alt="Preview"
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${scale})` }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )
      }
    </div>
  );
}
