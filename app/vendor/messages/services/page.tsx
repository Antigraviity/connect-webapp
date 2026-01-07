"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiMessageSquare, FiSearch, FiSend, FiPaperclip, FiMoreVertical,
  FiRefreshCw, FiPackage, FiArrowLeft, FiX, FiZoomIn, FiZoomOut,
  FiDownload, FiChevronDown, FiCornerUpLeft, FiCopy, FiSmile, FiTrash2, FiFile, FiLoader,
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

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
  isUploading?: boolean;
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
  attachment?: Attachment | Attachment[] | null;
  replyTo?: { id: string; content: string; sender: { name: string } };
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
  service?: { id: string; title: string };
  order?: { id: string; orderNumber: string };
}

const getLastMessageText = (lastMessage: string | LastMessageObj | null | undefined): string => {
  if (!lastMessage) return 'No messages yet';
  if (typeof lastMessage === 'string') return lastMessage;
  if (typeof lastMessage === 'object' && lastMessage.content) return lastMessage.content;
  if (typeof lastMessage === 'object' && lastMessage.attachment) return '📎 Attachment';
  return 'No messages yet';
};

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

function VendorServiceMessagesContent() {
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ url: string; file: File }[]>([]);
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  useEffect(() => { if (currentUser?.id) fetchConversations(true); }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = () => { setActiveMessageDropdown(null); setReactionPickerMessageId(null); };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => { if (replyingTo) textareaRef.current?.focus(); }, [replyingTo]);

  useEffect(() => { if (selectedConversation && currentUser?.id) fetchMessages(selectedConversation); }, [selectedConversation, currentUser?.id]);

  useEffect(() => {
    if (initialOtherUserId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === initialOtherUserId);
      if (conv && !lastHighlightedId.current?.includes(`conv-${initialOtherUserId}`)) {
        setHighlightedConversationId(initialOtherUserId);
        setTimeout(() => setHighlightedConversationId(null), 3500);
        lastHighlightedId.current = (lastHighlightedId.current || "") + `conv-${initialOtherUserId}`;
      }
    }
    if (initialMessageId && messages.length > 0 && !lastHighlightedId.current?.includes(`msg-${initialMessageId}`)) {
      setTimeout(() => {
        const el = document.getElementById(`message-${initialMessageId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedMessageId(initialMessageId);
          lastHighlightedId.current = (lastHighlightedId.current || "") + `msg-${initialMessageId}`;
          if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = setTimeout(() => setHighlightedMessageId(null), 3500);
        }
      }, 500);
    }
  }, [messages, initialMessageId, initialOtherUserId, conversations]);

  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesCount.current;
    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      const sentByMe = lastMessage?.isMine;
      const container = messagesEndRef.current?.parentElement;
      const isAtBottom = container ? container.scrollHeight - container.scrollTop <= container.clientHeight + 150 : true;
      if (isInitialLoad.current || sentByMe || isAtBottom) {
        scrollToBottom();
        if (isInitialLoad.current && messages.length > 0) isInitialLoad.current = false;
      }
    }
    prevMessagesCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (!selectedConversation || !currentUser?.id) return;
    const interval = setInterval(() => fetchMessages(selectedConversation, true), 5000);
    return () => clearInterval(interval);
  }, [selectedConversation, currentUser?.id]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior }), 100);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior }), 500);
  };

  const fetchConversations = async (forceSelectLatest = false) => {
    try {
      if (forceSelectLatest) setLoading(true);
      const response = await fetch(`/api/messages?userId=${currentUser?.id}&type=SERVICE`);
      const result = await response.json();
      if (result.success) {
        const uniqueConversations = (result.conversations || []).filter((conv: Conversation, index: number, self: Conversation[]) =>
          index === self.findIndex((c) => c.id === conv.id)
        );
        setConversations(uniqueConversations);
        if ((!selectedConversation || forceSelectLatest) && uniqueConversations.length > 0) {
          const targetId = (forceSelectLatest ? null : initialOtherUserId) || uniqueConversations[0].id;
          if (selectedConversation === targetId && forceSelectLatest) fetchMessages(targetId);
          else setSelectedConversation(targetId);
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
      const response = await fetch(`/api/messages?userId=${currentUser?.id}&conversationWith=${otherUserId}&type=SERVICE`);
      const result = await response.json();
      if (result.success) {
        const fetchedMessages = result.messages || [];
        setMessages(prev => {
          const optimistic = prev.filter(m => m.id.startsWith('temp-'));
          const currentNonOptimistic = prev.filter(m => !m.id.startsWith('temp-'));
          if (silent && JSON.stringify(fetchedMessages) === JSON.stringify(currentNonOptimistic)) return prev;
          return [...fetchedMessages, ...optimistic];
        });
        if (!silent) setTimeout(() => scrollToBottom("instant"), 50);
        setConversations(prev => prev.map(conv => conv.id === otherUserId ? { ...conv, unreadCount: 0 } : conv));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, reactions: [...(msg.reactions || []), emoji] } : msg));
    setReactionPickerMessageId(null);
    try {
      const response = await fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, emoji }) });
      const data = await response.json();
      if (data.success) setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, reactions: data.reactions } : msg));
    } catch (err) { console.error('Reaction error:', err); }
    setActiveMessageDropdown(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (selectedFiles.length + files.length > 10) { alert('You can only upload up to 10 files at once.'); return; }
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { alert(`File ${file.name} exceeds 10MB limit`); return; }
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreviews(prev => [...prev, { url: e.target?.result as string, file }]);
        reader.readAsDataURL(file);
      } else setFilePreviews(prev => [...prev, { url: '', file }]);
      setSelectedFiles(prev => [...prev, file]);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]); setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File): Promise<Attachment | null> => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64, fileName: file.name, fileType: file.type, fileSize: file.size }) });
      const data = await response.json();
      return data.success ? data.file : null;
    } catch { return null; }
  };

  const handleSendMessage = async () => {
    const content = messageInput.trim();
    if ((!content && selectedFiles.length === 0) || !selectedConversation || !currentUser?.id) return;
    const currentFiles = [...selectedFiles];
    const currentPreviews = [...filePreviews];
    setMessageInput(""); setReplyingTo(null); clearSelectedFiles(); setSendingMessage(true);
    const tempId = `temp-${Date.now()}`;
    let initialAttachments: Attachment[] = currentPreviews.map(p => ({ url: p.url, name: p.file.name, type: p.file.type, size: p.file.size, isUploading: true }));
    const tempMessage: Message = {
      id: tempId, content, senderId: currentUser.id, receiverId: selectedConversation,
      sender: currentUser, receiver: conversations.find(c => c.id === selectedConversation)?.otherUser || { id: selectedConversation, name: '' },
      read: false, createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      isMine: true,
      attachment: initialAttachments.length === 1 ? initialAttachments[0] : initialAttachments.length > 1 ? initialAttachments : null,
      replyTo: replyingTo ? { id: replyingTo.id, content: replyingTo.content, sender: { name: replyingTo.isMine ? 'You' : replyingTo.sender.name } } : undefined,
    };
    setMessages(prev => [...prev, tempMessage]);
    try {
      let finalAttachments: Attachment[] = [];
      if (currentFiles.length > 0) {
        setUploadingFile(true);
        for (let i = 0; i < currentFiles.length; i++) {
          const uploaded = await uploadFile(currentFiles[i]);
          if (uploaded) {
            finalAttachments.push(uploaded);
            setMessages(prev => prev.map(m => {
              if (m.id === tempId) {
                const updatedAttachments = initialAttachments.map((at, idx) => idx === i ? { ...uploaded, isUploading: false } : at);
                return { ...m, attachment: updatedAttachments.length === 1 ? updatedAttachments[0] : updatedAttachments };
              }
              return m;
            }));
          }
        }
        setUploadingFile(false);
      }
      const response = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id, receiverId: selectedConversation, content, type: 'SERVICE',
          attachment: finalAttachments.length === 1 ? finalAttachments[0] : finalAttachments.length > 1 ? finalAttachments : null,
          replyToId: replyingTo?.id,
        })
      });
      const result = await response.json();
      if (result.success) {
        const newMessage = result.message || result.data;
        setMessages(prev => prev.map(msg => msg.id === tempId ? newMessage : msg));
        setConversations(prev => prev.map(conv => conv.id === selectedConversation ? { ...conv, lastMessage: content || (finalAttachments.length > 0 ? `📎 ${finalAttachments.length > 1 ? finalAttachments.length + ' Attachments' : 'Attachment'}` : ''), time: 'Just now' } : conv));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSendingMessage(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(part => part.charAt(0).toUpperCase()).slice(0, 2).join('');
  };

  const parseAttachment = (attachment: any): Attachment | Attachment[] | null => {
    if (!attachment) return null;
    if (typeof attachment === 'object') return attachment;
    if (typeof attachment === 'string') { try { return JSON.parse(attachment); } catch { return null; } }
    return null;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.service?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentConversation = conversations.find(c => c.id === selectedConversation);

  if (loading && conversations.length === 0) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" color="vendor" label="Loading messages..." /></div>;
  }

  return (
    <div className="p-6 h-[calc(100vh-64px)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><FiPackage className="w-6 h-6 text-emerald-600" /><h1 className="text-2xl font-bold text-gray-900">Service Messages</h1></div>
          <p className="text-gray-600">Communicate with customers about their service bookings</p>
        </div>
        <button onClick={() => fetchConversations(true)} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium shadow-sm">
          {loading ? <LoadingSpinner size="sm" color="current" /> : <FiRefreshCw className="w-4 h-4" />}Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex h-[calc(100%-80px)]">
        <div className={`w-full md:w-96 border-r border-gray-200 flex flex-col ${showMobileChat ? 'hidden md:flex' : ''}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conversation => (
                <button key={conversation.id} onClick={() => { setSelectedConversation(conversation.id); setShowMobileChat(true); }} className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedConversation === conversation.id ? "bg-emerald-50" : ""} ${highlightedConversationId === conversation.id ? "animate-highlight" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                        {conversation.otherUser?.image ? <img src={conversation.otherUser.image} alt={conversation.otherUser?.name || 'User'} className="w-full h-full object-cover" /> : getInitials(conversation.otherUser?.name || 'U')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1"><h4 className="font-semibold text-gray-900 truncate">{conversation.otherUser?.name || 'Unknown'}</h4><span className="text-xs text-gray-500">{conversation.time}</span></div>
                      {conversation.service && <p className="text-xs text-emerald-600 truncate flex items-center gap-1 mb-1"><FiPackage className="w-3 h-3" />{conversation.service.title}</p>}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{getLastMessageText(conversation.lastMessage)}</p>
                        {conversation.unreadCount > 0 && <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{conversation.unreadCount}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500"><FiMessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="font-medium">No conversations yet</p><p className="text-sm mt-1">Messages from customers will appear here</p></div>
            )}
          </div>
        </div>

        {currentConversation ? (
          <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : ''}`}>
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowMobileChat(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg"><FiArrowLeft className="w-5 h-5" /></button>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                    {currentConversation.otherUser?.image ? <img src={currentConversation.otherUser.image} alt={currentConversation.otherUser?.name || 'User'} className="w-full h-full object-cover" /> : getInitials(currentConversation.otherUser?.name || 'U')}
                  </div>
                  <div><h3 className="font-semibold text-gray-900">{currentConversation.otherUser?.name || 'Unknown'}</h3><p className="text-xs text-gray-600">{currentConversation.service?.title || 'Service inquiry'}{currentConversation.order && <span className="text-emerald-600"> • {currentConversation.order.orderNumber}</span>}</p></div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg"><FiMoreVertical className="w-5 h-5 text-gray-600" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length > 0 ? (
                <>
                  {messages.map((message, index) => {
                    const attachmentRaw = parseAttachment(message.attachment);
                    const attachments = Array.isArray(attachmentRaw) ? attachmentRaw : (attachmentRaw ? [attachmentRaw] : []);
                    const isTemp = message.id.startsWith('temp-');
                    const isImage = attachments.length > 0 && attachments.every(at => at.type?.startsWith('image/') || at.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));

                    return (
                      <div key={message.id} id={`message-${message.id}`} className={`flex ${message.isMine ? "justify-end" : "justify-start"} mb-2`}>
                        <div className={`flex flex-col max-w-[70%] ${message.isMine ? 'items-end' : 'items-start'}`}>
                          <div className={`rounded-lg relative group ${isImage ? 'p-0' : 'px-4 py-2.5'} ${message.isMine ? "bg-[#d9fdd3] text-gray-900 rounded-tr-none" : "bg-white text-gray-900 rounded-tl-none shadow-sm"} ${highlightedMessageId === message.id ? "animate-highlight" : ""}`}>
                            <button onClick={(e) => { e.stopPropagation(); setActiveMessageDropdown(activeMessageDropdown === message.id ? null : message.id); }} className={`absolute top-1 right-1 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isImage ? 'bg-white/90 shadow-sm' : 'bg-inherit'}`}><FiChevronDown className="w-4 h-4" /></button>

                          {activeMessageDropdown === message.id && (
                            <div className={`absolute ${index > messages.length - 3 ? 'bottom-full mb-1' : 'top-full mt-1'} ${message.isMine ? 'right-0' : 'left-0'} w-40 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[100]`} onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => { setReplyingTo(message); setActiveMessageDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"><FiCornerUpLeft className="w-4 h-4 text-gray-500" /> Reply</button>
                              <button onClick={() => { navigator.clipboard.writeText(message.content); setActiveMessageDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"><FiCopy className="w-4 h-4 text-gray-500" /> Copy</button>
                              <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setReactionPickerMessageId(reactionPickerMessageId === message.id ? null : message.id); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"><FiSmile className="w-4 h-4 text-gray-500" /> React</button>
                                {reactionPickerMessageId === message.id && (
                                  <div className={`absolute ${message.isMine ? 'right-full mr-2' : 'left-full ml-2'} top-0 bg-white rounded-full shadow-lg border border-gray-200 p-1.5 flex items-center gap-1 z-[110]`}>
                                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => <button key={emoji} onClick={() => handleAddReaction(message.id, emoji)} className="hover:scale-125 transition-transform p-1 text-lg">{emoji}</button>)}
                                  </div>
                                )}
                              </div>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button onClick={() => { setMessages(prev => prev.filter(m => m.id !== message.id)); setActiveMessageDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"><FiTrash2 className="w-4 h-4" /> Delete</button>
                            </div>
                          )}

                          {message.replyTo && (
                            <div className={`mb-2 p-2 rounded border-l-4 ${isImage ? 'mx-4 mt-2' : ''} ${message.isMine ? 'bg-black/5 border-emerald-500' : 'bg-gray-100 border-gray-400'} text-xs`}>
                              <p className="font-bold mb-0.5 text-emerald-700">{message.replyTo.sender?.name}</p>
                              <p className="truncate opacity-80">{message.replyTo.content}</p>
                            </div>
                          )}

                          {attachments.length > 0 && (
                            <div className={isImage ? "relative group" : "mb-2 space-y-2"}>
                              {isImage ? (
                                <div className={`grid gap-1 ${attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                  {attachments.slice(0, 4).map((at, idx) => {
                                    const isLastExtra = idx === 3 && attachments.length > 4;
                                    return (
                                      <div key={idx} className="relative overflow-hidden aspect-square sm:aspect-auto">
                                        <button onClick={() => { setPreviewImage({ url: at.url, senderName: message.isMine ? 'You' : currentConversation?.otherUser?.name || 'User', senderImage: (message.isMine ? currentUser?.image : currentConversation?.otherUser?.image) ?? undefined, timestamp: message.timestamp }); setScale(1); }} className="block w-full h-full text-left focus:outline-none">
                                          <img src={at.url} alt={at.name || 'Image'} className={`w-full ${attachments.length > 1 ? 'h-32' : 'max-h-64'} object-cover cursor-pointer hover:opacity-95 transition-all block ${at.isUploading ? 'blur-[2px] brightness-75' : ''}`} />
                                          {at.isUploading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></div>}
                                          {isLastExtra && <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]"><span className="text-white text-xl font-bold">+{attachments.length - 3}</span></div>}
                                        </button>
                                        {(idx === attachments.length - 1 || idx === 3) && (
                                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/40 text-white backdrop-blur-[2px] flex items-center gap-1">
                                            <span>{message.timestamp}</span>
                                            {message.isMine && (isTemp ? <BsCheck className="w-3 h-3 text-white" /> : message.read ? <BsCheckAll className="w-3 h-3 text-blue-400" /> : <BsCheckAll className="w-3 h-3 text-white" />)}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                attachments.map((at, idx) => (
                                  <a key={idx} href={at.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${message.isMine ? 'bg-[#d1f2cc]' : 'bg-gray-100'}`}>
                                    <FiPaperclip className="w-5 h-5 text-gray-500" />
                                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate text-gray-900">{at.name || 'File'}</p>{at.size && <p className="text-xs text-gray-500">{formatFileSize(at.size)}</p>}</div>
                                    <FiDownload className="w-4 h-4 text-gray-500" />
                                  </a>
                                ))
                              )}
                            </div>
                          )}

                          {message.content && (
                            <div className={`relative ${isImage ? 'px-4 pb-2.5 pt-2' : ''}`}>
                              <span className="text-sm whitespace-pre-wrap">{message.content}</span>
                            </div>
                          )}
                          {!isImage && (
                            <span className="float-right flex items-center gap-1 ml-2 mt-2 -mb-0.5">
                              <span className="text-[10px] text-gray-500">{message.timestamp}</span>
                              {message.isMine && (isTemp ? <BsCheck className="w-4 h-4 text-gray-400" /> : message.read ? <BsCheckAll className="w-4 h-4 text-[#53bdeb]" /> : <BsCheckAll className="w-4 h-4 text-gray-400" />)}
                            </span>
                          )}
                          </div>
                          {/* Reactions display - moved outside the bubble to prevent clipping */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className={`flex -space-x-1 -mt-2 ${message.isMine ? 'mr-2 justify-end' : 'ml-2 justify-start'}`}>
                              {message.reactions.map((emoji, idx) => <span key={idx} className="bg-white rounded-full shadow-md border border-gray-200 px-1.5 py-0.5 text-sm">{emoji}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full"><div className="text-center text-gray-500"><FiMessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No messages yet</p><p className="text-sm">Start the conversation!</p></div></div>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected</span>
                  <button onClick={clearSelectedFiles} className="text-xs text-red-600 hover:text-red-700 font-medium">Clear all</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-3 pt-2">
                  {filePreviews.map((preview, idx) => (
                    <div key={idx} className="relative shrink-0 w-20 h-20 group">
                      {preview.url ? <img src={preview.url} alt="Preview" className="w-full h-full rounded-lg object-cover border border-gray-200" /> : <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200 p-1"><FiFile className="w-6 h-6 text-gray-400 mb-1" /><p className="text-[10px] text-gray-500 truncate w-full text-center px-1">{preview.file.name.split('.').pop()?.toUpperCase()}</p></div>}
                      <button onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"><FiX className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t border-emerald-200 flex items-center justify-between">
                <div className="border-l-4 border-emerald-500 pl-3 py-1 overflow-hidden">
                  <p className="text-xs font-bold text-emerald-700">Replying to {replyingTo.isMine ? 'Yourself' : replyingTo.sender.name}</p>
                  <p className="text-sm text-gray-600 truncate">{replyingTo.content}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><FiX className="w-5 h-5 text-gray-500" /></button>
              </div>
            )}

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingFile || sendingMessage} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploadingFile ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiPaperclip className="w-5 h-5" />}
                </button>
                <textarea ref={textareaRef} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Type a message..." disabled={sendingMessage} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 resize-none h-9 overflow-hidden"></textarea>
                <button onClick={handleSendMessage} disabled={(!messageInput.trim() && selectedFiles.length === 0) || sendingMessage} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {sendingMessage ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiSend className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
            <div className="text-center"><FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Select a conversation to start messaging</p></div>
          </div>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setPreviewImage(null)}>
          <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-sm z-50 shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 shrink-0">
                {previewImage.senderImage ? <img src={previewImage.senderImage} alt={previewImage.senderName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-semibold">{previewImage.senderName[0]}</div>}
              </div>
              <div><div className="text-white font-medium">{previewImage.senderName}</div><div className="text-gray-400 text-xs">{previewImage.timestamp}</div></div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setScale(s => Math.min(s + 0.5, 3))} className="p-2 text-gray-400 hover:text-white" title="Zoom In"><FiZoomIn className="w-5 h-5" /></button>
              <button onClick={() => setScale(s => Math.max(s - 0.5, 0.5))} className="p-2 text-gray-400 hover:text-white" title="Zoom Out"><FiZoomOut className="w-5 h-5" /></button>
              <a href={previewImage.url} download target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white" title="Download" onClick={(e) => e.stopPropagation()}><FiDownload className="w-5 h-5" /></a>
              <button onClick={() => setPreviewImage(null)} className="p-2 text-gray-400 hover:text-white" title="Close"><FiX className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
            <img src={previewImage.url} alt="Preview" className="max-w-full max-h-full object-contain transition-transform duration-200" style={{ transform: `scale(${scale})` }} onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorServiceMessages() {
  return (
    <Suspense fallback={<div className="p-6 h-[calc(100vh-64px)] flex items-center justify-center"><LoadingSpinner size="lg" color="vendor" label="Loading messages..." /></div>}>
      <VendorServiceMessagesContent />
    </Suspense>
  );
}
