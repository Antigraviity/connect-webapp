"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  FiMessageSquare, FiSearch, FiSend, FiPaperclip, FiMoreVertical,
  FiUser, FiFilter, FiBriefcase, FiRefreshCw, FiX,
  FiImage, FiFile, FiDownload, FiZoomIn, FiZoomOut, FiArrowLeft,
  FiChevronDown, FiCornerUpLeft, FiCopy, FiSmile, FiTrash2
} from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { useAuth } from "@/lib/useAuth";
import { Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

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
  relatedJob?: {
    id: string;
    title: string;
  } | null;
}

export default function CompanyMessagesPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="company" className="mx-auto" />
      </div>
    }>
      <CompanyMessagesContent />
    </Suspense>
  );
}

function CompanyMessagesContent() {
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
  const initialOtherUserId = searchParams.get('chat') || searchParams.get('userId') || searchParams.get('conversationWith');
  const initialMessageId = searchParams.get('messageId');
  const prevMessagesCount = useRef(0);
  const isInitialLoad = useRef(true);
  const lastHighlightedId = useRef<string | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialOtherUserId) {
      setSelectedConversation(initialOtherUserId);
    }
  }, [initialOtherUserId]);

  useEffect(() => {
    if (user?.id) {
      fetchConversations(false, true);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [user, selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      fetchMessages(selectedConversation, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMessageDropdown(null);
      setReactionPickerMessageId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      fetchConversations(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (initialOtherUserId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === initialOtherUserId);
      if (conv && !lastHighlightedId.current?.includes(`conv-${initialOtherUserId}`)) {
        setHighlightedConversationId(initialOtherUserId);
        const timer = setTimeout(() => setHighlightedConversationId(null), 3500);
        lastHighlightedId.current = (lastHighlightedId.current || "") + `conv-${initialOtherUserId}`;
      }
    }

    if (initialMessageId && messages.length > 0 && !lastHighlightedId.current?.includes(`msg-${initialMessageId}`)) {
      const timer = setTimeout(() => {
        const messageElement = document.getElementById(`message-${initialMessageId}`);
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightedMessageId(initialMessageId);
          lastHighlightedId.current = (lastHighlightedId.current || "") + `msg-${initialMessageId}`;
          if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = setTimeout(() => {
            setHighlightedMessageId(null);
          }, 3500);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages, initialMessageId, initialOtherUserId, conversations]);

  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesCount.current;
    if (isNewMessage) {
      const lastMessage = messages[messages.length - 1];
      const sentByMe = lastMessage?.senderId === user?.id;
      const container = messagesEndRef.current?.parentElement;
      const isAtBottom = container ? container.scrollHeight - container.scrollTop <= container.clientHeight + 150 : true;
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
    messagesEndRef.current.scrollIntoView({ behavior });
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior }); }, 100);
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior }); }, 500);
  };

  const fetchConversations = async (silent = false, forceSelectLatest = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const response = await fetch(`/api/messages?userId=${user?.id}&conversationList=true&type=JOB`);
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations || []);
        // Only auto-select if there's no conversation selected AND (forceSelectLatest OR initialOtherUserId)
        if (!selectedConversation && data.conversations.length > 0) {
          const targetId = initialOtherUserId || (forceSelectLatest ? data.conversations[0].id : null);
          if (targetId) {
            setSelectedConversation(targetId);
          }
        }
      } else if (!silent) setError(data.message || 'Failed to fetch conversations');
    } catch (err) {
      if (!silent) setError('An error occurred while loading conversations');
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  const fetchMessages = async (otherUserId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages?userId=${user?.id}&otherUserId=${otherUserId}&type=JOB`);
      const data = await response.json();
      if (data.success) {
        const newMessages = data.messages || [];
        setMessages(prev => {
          const optimistic = prev.filter(m => m.id.startsWith('temp-'));
          const currentNonOptimistic = prev.filter(m => !m.id.startsWith('temp-'));
          if (silent && JSON.stringify(newMessages) === JSON.stringify(currentNonOptimistic)) return prev;
          return [...newMessages, ...optimistic];
        });
        if (!silent) setTimeout(() => scrollToBottom("instant"), 50);
        setConversations(prev => prev.map(conv => conv.id === otherUserId ? { ...conv, unreadCount: 0 } : conv));
      }
    } catch (err) {
      if (!silent) console.error('Fetch messages error:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
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
    setSelectedFiles([]);
    setFilePreviews([]);
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
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, fileName: file.name, fileType: file.type, fileSize: file.size }),
      });
      const data = await response.json();
      return data.success ? data.file : null;
    } catch { return null; }
  };

  const handleSendMessage = async (customAttachment: Attachment | null = null) => {
    if ((!messageInput.trim() && selectedFiles.length === 0 && !customAttachment) || !selectedConversation || !user?.id) return;
    const content = messageInput.trim();
    const currentFiles = [...selectedFiles];
    const currentPreviews = [...filePreviews];
    setMessageInput(""); setReplyingTo(null); clearSelectedFiles(); setSendingMessage(true);
    const tempId = `temp-${Date.now()}`;
    let initialAttachments: Attachment[] = customAttachment ? [customAttachment] : currentPreviews.map(p => ({ url: p.url, name: p.file.name, type: p.file.type, size: p.file.size, isUploading: true }));
    const tempMessage: Message = {
      id: tempId, content, attachment: initialAttachments.length === 1 ? initialAttachments[0] : initialAttachments.length > 1 ? initialAttachments : null,
      read: false, senderId: user.id, receiverId: selectedConversation, createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name || 'You', image: user.image }, receiver: { id: selectedConversation, name: '', image: undefined },
      isMine: true, replyTo: replyingTo ? { id: replyingTo.id, content: replyingTo.content, sender: { name: replyingTo.isMine ? 'You' : replyingTo.sender.name } } : undefined,
    };
    setMessages(prev => [...prev, tempMessage]);
    try {
      let finalAttachments: Attachment[] = customAttachment ? [customAttachment] : [];
      if (currentFiles.length > 0) {
        setUploadingFile(true);
        for (let i = 0; i < currentFiles.length; i++) {
          const uploaded = await uploadFile(currentFiles[i]);
          if (uploaded) {
            finalAttachments.push(uploaded);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, attachment: initialAttachments.map((at, idx) => idx === i ? { ...uploaded, isUploading: false } : at).length === 1 ? initialAttachments.map((at, idx) => idx === i ? { ...uploaded, isUploading: false } : at)[0] : initialAttachments.map((at, idx) => idx === i ? { ...uploaded, isUploading: false } : at) } : m));
          }
        }
        setUploadingFile(false);
      }
      const response = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.id, receiverId: selectedConversation, content, type: 'JOB', attachment: finalAttachments.length === 1 ? finalAttachments[0] : finalAttachments.length > 1 ? finalAttachments : null, replyToId: replyingTo?.id }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...data.data, isMine: true } : m));
        setConversations(prev => {
          const updated = prev.map(conv => conv.id === selectedConversation ? { ...conv, lastMessage: { content: content || (finalAttachments.length > 0 ? (finalAttachments.length === 1 ? '📎 Attachment' : `📎 ${finalAttachments.length} Attachments`) : ''), attachment: finalAttachments.length > 0 ? JSON.stringify(finalAttachments) : null, createdAt: new Date().toISOString(), isFromMe: true } } : conv);
          const idx = updated.findIndex(c => c.id === selectedConversation);
          if (idx > 0) { const [c] = updated.splice(idx, 1); updated.unshift(c); }
          return updated;
        });
      } else { setMessages(prev => prev.filter(m => m.id !== tempId)); alert(data.message || 'Failed to send message'); }
    } catch { setMessages(prev => prev.filter(m => m.id !== tempId)); alert('An error occurred'); } finally { setSendingMessage(false); }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, reactions: [...(msg.reactions || []), emoji] } : msg));
    setReactionPickerMessageId(null); setActiveMessageDropdown(null);
    try {
      const response = await fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, emoji }) });
      const data = await response.json();
      if (data.success) setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, reactions: data.reactions } : msg));
    } catch { }
  };

  const parseAttachment = (attachment: any): Attachment | Attachment[] | null => {
    if (!attachment) return null;
    if (typeof attachment === 'object') return attachment;
    if (typeof attachment === 'string') { try { return JSON.parse(attachment); } catch { return null; } }
    return null;
  };

  const filteredConversations = conversations.filter(conv => conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!user) return <div className="p-6 text-center"><h2 className="text-xl font-bold">Sign In Required</h2><a href="/signin" className="text-primary-600 underline">Sign In</a></div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div><div className="flex items-center gap-2 text-primary-600"><FiBriefcase className="w-6 h-6" /><h1 className="text-2xl font-bold text-gray-900">Applicant Messages</h1></div><p className="text-gray-600 mt-1">Manage communications with job applicants</p></div>
        <button onClick={() => fetchConversations(false, true)} disabled={loadingConversations} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"><FiRefreshCw className={`w-4 h-4 ${loadingConversations ? 'animate-spin' : ''}`} />Refresh</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-bold text-gray-900">Applicants</h2>{totalUnread > 0 && <p className="text-sm text-gray-600 mt-1">{totalUnread} unread</p>}</div><FiFilter className="text-gray-600 w-5 h-5" /></div>
              <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search applicants..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none" /></div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? <div className="p-8 text-center"><LoadingSpinner size="md" color="company" className="mx-auto mb-3" /><p>Loading...</p></div> : filteredConversations.length === 0 ? <div className="p-8 text-center"><FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-600">No conversations yet</p></div> : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map(conv => (
                    <button key={conv.id} onClick={() => setSelectedConversation(conv.id)} className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''} ${highlightedConversationId === conv.id ? "animate-highlight" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0"><div className="w-12 h-12 bg-gradient-to-br from-company-400 to-company-600 rounded-full flex items-center justify-center">{conv.user?.image ? <img src={conv.user.image} alt={conv.user.name} className="w-full h-full rounded-full object-cover" /> : <FiUser className="w-6 h-6 text-white" />}</div></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1"><h4 className="font-semibold text-gray-900 truncate">{conv.user?.name || 'Unknown Applicant'}</h4>{conv.lastMessage && <span className="text-xs text-gray-500">{formatTime(conv.lastMessage.createdAt)}</span>}</div>
                          {conv.relatedJob && <p className="text-xs text-primary-600 font-medium truncate mb-1 flex items-center gap-1"><FiBriefcase className="w-3 h-3" />{conv.relatedJob.title}</p>}
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage?.isFromMe && 'You: '}{conv.lastMessage?.content || (conv.lastMessage?.attachment ? '📎 Attachment' : 'No messages yet')}</p>
                          {conv.unreadCount > 0 && <span className="mt-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{conv.unreadCount}</span>}
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
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-company-400 to-company-600 rounded-full flex items-center justify-center">{currentConversation.user?.image ? <img src={currentConversation.user.image} alt={currentConversation.user.name} className="w-full h-full rounded-full object-cover" /> : <FiUser className="w-5 h-5 text-white" />}</div>
                <div><h3 className="font-semibold text-gray-900">{currentConversation.user?.name}</h3>{currentConversation.relatedJob ? <p className="text-xs text-primary-600 font-medium">{currentConversation.relatedJob.title}</p> : <p className="text-xs text-gray-600">Applicant</p>}</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loadingMessages ? <div className="flex justify-center items-center h-full"><LoadingSpinner size="md" color="company" /></div> : messages.length === 0 ? <div className="flex flex-col items-center justify-center h-full opacity-50"><FiMessageSquare className="w-12 h-12 mb-2" /><p>No messages yet</p></div> : (
                  <>
                    {messages.map((msg, idx) => {
                      const isMe = msg.isMine;
                      const attachmentRaw = parseAttachment(msg.attachment);
                      const attachments = Array.isArray(attachmentRaw) ? attachmentRaw : (attachmentRaw ? [attachmentRaw] : []);
                      const isImage = attachments.length > 0 && attachments.every(at => at.type?.startsWith('image/') || at.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));
                      return (
                        <div key={msg.id} id={`message-${msg.id}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                          <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`rounded-2xl relative group ${isImage ? 'p-0 overflow-hidden' : 'px-4 py-2.5 shadow-sm'} ${isMe ? 'bg-gradient-to-r from-company-400 to-company-600 text-white rounded-tr-none' : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'} ${highlightedMessageId === msg.id ? "animate-highlight" : ""}`}>
                              <button onClick={(e) => { e.stopPropagation(); setActiveMessageDropdown(activeMessageDropdown === msg.id ? null : msg.id); }} className="absolute top-1 right-1 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"><FiChevronDown /></button>
                              {activeMessageDropdown === msg.id && (
                                <div className={`absolute ${idx > messages.length - 3 ? 'bottom-full mb-1' : 'top-full mt-1'} ${isMe ? 'right-0' : 'left-0'} w-40 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[100]`}>
                                  <button onClick={() => { setReplyingTo(msg); setActiveMessageDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"><FiCornerUpLeft className="w-4 h-4 text-gray-500" /> Reply</button>
                                  <button onClick={() => { navigator.clipboard.writeText(msg.content); setActiveMessageDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"><FiCopy className="w-4 h-4 text-gray-500" /> Copy</button>
                                  <div className="relative">
                                    <button onClick={(e) => { e.stopPropagation(); setReactionPickerMessageId(reactionPickerMessageId === msg.id ? null : msg.id); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"><FiSmile className="w-4 h-4 text-gray-500" /> React</button>
                                    {reactionPickerMessageId === msg.id && (
                                      <div className={`absolute ${isMe ? 'right-full mr-2' : 'left-full ml-2'} top-0 bg-white rounded-full shadow-lg border border-gray-200 p-1.5 flex gap-1 z-[110]`}>
                                        {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(e => <button key={e} onClick={() => handleAddReaction(msg.id, e)} className="hover:scale-125 p-1 text-lg">{e}</button>)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <button onClick={() => { setMessages(prev => prev.filter(m => m.id !== msg.id)); setActiveMessageDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"><FiTrash2 className="w-4 h-4" /> Delete</button>
                                </div>
                              )}
                              {msg.replyTo && <div className={`mb-2 p-2 rounded border-l-4 ${isMe ? 'bg-white/10 border-white/40' : 'bg-gray-100 border-gray-300'} text-xs truncate`}><p className="font-bold">{msg.replyTo.sender.name}</p><p>{msg.replyTo.content}</p></div>}
                              {attachments.length > 0 && (
                                <div className={isImage ? "relative" : "mb-2 space-y-2"}>
                                  {isImage ? (
                                    <div className={`grid gap-1 ${attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                      {attachments.slice(0, 4).map((at, i) => (
                                        <div key={i} className="relative aspect-square sm:aspect-auto overflow-hidden">
                                          <img src={at.url} alt="at" onClick={() => { setPreviewImage({ url: at.url, senderName: isMe ? 'You' : msg.sender.name, senderImage: isMe ? user.image : msg.sender.image, timestamp: formatTime(msg.createdAt) }); setScale(1); }} className={`w-full ${attachments.length > 1 ? 'h-32' : 'max-h-64'} object-cover cursor-pointer hover:opacity-95 ${at.isUploading ? 'blur-[2px] brightness-75' : ''}`} />
                                          {at.isUploading && <div className="absolute inset-0 flex items-center justify-center animate-spin"><LoadingSpinner size="sm" color="white" /></div>}
                                          {i === 3 && attachments.length > 4 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">+{attachments.length - 3}</div>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : attachments.map((at, i) => (
                                    <a key={i} href={at.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-white/10 border border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                                      <FiPaperclip className="shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{at.name}</p><p className="text-xs opacity-60">{(at.size / 1024).toFixed(1)} KB</p></div><FiDownload />
                                    </a>
                                  ))}
                                </div>
                              )}
                              {msg.content && (
                                <div className={`relative ${isImage ? 'px-4 pb-2.5 pt-2' : ''}`}>
                                  <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
                                </div>
                              )}
                            </div>
                            {/* Reactions display - moved outside the bubble to prevent clipping */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className={`flex -space-x-1 -mt-2 ${isMe ? 'mr-2 justify-end' : 'ml-2 justify-start'}`}>
                                {msg.reactions.map((e, i) => <span key={i} className="bg-white rounded-full shadow-md border border-gray-200 px-1.5 py-0.5 text-sm">{e}</span>)}
                              </div>
                            )}
                            <div className={`flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMe && (msg.id.startsWith('temp-') ? <BsCheck /> : msg.read ? <BsCheckAll className="text-primary-500" /> : <BsCheckAll />)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {selectedFiles.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2 text-xs font-semibold text-gray-500 uppercase"><span>{selectedFiles.length} file(s) selected</span><button onClick={clearSelectedFiles} className="text-red-600 hover:text-red-700">Clear all</button></div>
                  <div className="flex gap-3 overflow-x-auto pb-3 pt-2">
                    {filePreviews.map((p, i) => (
                      <div key={i} className="relative shrink-0 w-20 h-20 group">
                        {p.url ? <img src={p.url} className="w-full h-full rounded-lg object-cover border border-gray-200" /> : <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200 p-1"><FiFile className="text-gray-400 w-6 h-6 mb-1" /><span className="text-[10px] truncate w-full text-center">{p.file.name.split('.').pop()?.toUpperCase()}</span></div>}
                        <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"><FiX className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {replyingTo && (
                <div className="px-4 py-2 bg-gray-50 border-t border-primary-200 flex items-center justify-between">
                  <div className="border-l-4 border-primary-500 pl-3 py-1 overflow-hidden"><p className="text-xs font-bold text-primary-700">Replying to {replyingTo.isMine ? 'Yourself' : replyingTo.sender.name}</p><p className="text-sm text-gray-600 truncate">{replyingTo.content}</p></div>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full"><FiX /></button>
                </div>
              )}

              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={sendingMessage || uploadingFile} className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-lg disabled:opacity-50" title="Attach">{uploadingFile ? <LoadingSpinner size="sm" color="current" /> : <FiPaperclip />}</button>
                  <textarea ref={textareaRef} value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Type a message..." rows={1} className="flex-1 h-10 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-company-500 focus:bg-white transition-all outline-none resize-none" disabled={sendingMessage} />
                  <button onClick={() => handleSendMessage()} disabled={(!messageInput.trim() && selectedFiles.length === 0) || sendingMessage} className="h-10 w-10 flex items-center justify-center bg-gradient-to-r from-company-400 to-company-600 text-white rounded-lg hover:from-company-500 hover:to-company-700 transition-all disabled:opacity-50">{sendingMessage ? <LoadingSpinner size="sm" color="white" /> : <FiSend />}</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50"><div className="text-center"><FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No Applicant Selected</h3><p className="text-gray-600">Select an applicant to start messaging</p></div></div>
          )}
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setPreviewImage(null)}>
          <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-sm shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 shrink-0">{previewImage?.senderImage ? <img src={previewImage.senderImage} alt={previewImage.senderName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-semibold">{previewImage?.senderName?.[0] || 'U'}</div>}</div><div><div className="text-white font-medium">{previewImage?.senderName}</div><div className="text-gray-400 text-xs">{previewImage?.timestamp}</div></div></div>
            <div className="flex items-center gap-4"><button onClick={() => setScale(s => Math.min(s + 0.5, 3))} className="p-2 text-gray-400 hover:text-white transition-colors" title="Zoom In"><FiZoomIn /></button><button onClick={() => setScale(s => Math.max(s - 0.5, 0.5))} className="p-2 text-gray-400 hover:text-white transition-colors" title="Zoom Out"><FiZoomOut /></button><a href={previewImage?.url} download className="p-2 text-gray-400 hover:text-white transition-colors" title="Download" onClick={(e) => e.stopPropagation()}><FiDownload /></a><button onClick={() => setPreviewImage(null)} className="p-2 text-gray-400 hover:text-white transition-colors" title="Close"><FiX /></button></div>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden p-4"><img src={previewImage?.url} alt="Preview" className="max-w-full max-h-full object-contain transition-transform duration-200" style={{ transform: `scale(${scale})` }} onClick={(e) => e.stopPropagation()} /></div>
        </div>
      )}
    </div>
  );
}
