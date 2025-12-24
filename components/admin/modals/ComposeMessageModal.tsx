'use client';

import { useState } from 'react';
import { X, Send, Paperclip, Users, AlertCircle, CheckCircle, User, Building2, Search, Plus, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  avatar: string;
  status: string;
}

interface Attachment {
  id: string | number;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface MessageData {
  recipients: User[];
  recipientType: string;
  subject: string;
  content: string;
  category: string;
  priority: string;
  attachments: Attachment[];
  sendImmediate: boolean;
  scheduledDate: string;
  scheduledTime: string;
  requestReadReceipt: boolean;
  allowReplies: boolean;
  useTemplate: boolean;
  templateId: string;
  sendEmail: boolean;
  sendSMS: boolean;
  sendInApp: boolean;
}

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (messageData: any) => void;
}

export default function ComposeMessageModal({ isOpen, onClose, onSend }: ComposeMessageModalProps) {
  const [messageData, setMessageData] = useState<MessageData>({
    // Recipients
    recipients: [],
    recipientType: 'individual', // 'individual', 'group', 'broadcast'
    
    // Message Content
    subject: '',
    content: '',
    category: 'general',
    priority: 'normal',
    
    // Attachments
    attachments: [],
    
    // Options
    sendImmediate: true,
    scheduledDate: '',
    scheduledTime: '',
    requestReadReceipt: false,
    allowReplies: true,
    
    // Templates
    useTemplate: false,
    templateId: '',
    
    // Delivery Options
    sendEmail: true,
    sendSMS: false,
    sendInApp: true
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Mock data for users
  const allUsers: User[] = [
    { id: 'U001', name: 'Rahul Sharma', email: 'rahul.s@email.com', type: 'Customer', avatar: 'RS', status: 'online' },
    { id: 'U002', name: 'Sarah Johnson', email: 'sarah.j@email.com', type: 'Service Provider', avatar: 'SJ', status: 'offline' },
    { id: 'U003', name: 'Priya Patel', email: 'priya.p@email.com', type: 'Customer', avatar: 'PP', status: 'online' },
    { id: 'U004', name: 'Mike Rodriguez', email: 'mike.r@email.com', type: 'Service Provider', avatar: 'MR', status: 'busy' },
    { id: 'U005', name: 'Amit Kumar', email: 'amit.k@email.com', type: 'Customer', avatar: 'AK', status: 'online' },
    { id: 'U006', name: 'Lisa Chen', email: 'lisa.c@email.com', type: 'Service Provider', avatar: 'LC', status: 'offline' },
    { id: 'U007', name: 'David Singh', email: 'david.s@email.com', type: 'Employer', avatar: 'DS', status: 'online' },
    { id: 'U008', name: 'Tech Solutions Inc.', email: 'contact@techsolutions.com', type: 'Company', avatar: 'TS', status: 'online' }
  ];

  const messageCategories = [
    { value: 'general', label: 'General Communication' },
    { value: 'service-inquiry', label: 'Service Inquiry' },
    { value: 'support', label: 'Support' },
    { value: 'job-application', label: 'Job Application' },
    { value: 'payment', label: 'Payment Related' },
    { value: 'platform-update', label: 'Platform Update' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'announcement', label: 'Announcement' }
  ];

  const messageTemplates = [
    { id: 'T001', name: 'Welcome Message', category: 'general', content: 'Welcome to Connect! We\'re excited to have you on board.' },
    { id: 'T002', name: 'Service Inquiry Response', category: 'service-inquiry', content: 'Thank you for your service inquiry. We\'ll connect you with the right provider shortly.' },
    { id: 'T003', name: 'Payment Confirmation', category: 'payment', content: 'Your payment has been processed successfully. Transaction ID: {transaction_id}' },
    { id: 'T004', name: 'Job Application Update', category: 'job-application', content: 'Thank you for your job application. We\'ll review it and get back to you soon.' },
    { id: 'T005', name: 'Platform Maintenance', category: 'announcement', content: 'We\'ll be performing scheduled maintenance on {date} from {time}. Service may be temporarily unavailable.' }
  ];

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setMessageData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setMessageData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUserSelection = (user: User) => {
    if (messageData.recipients.find((r: User) => r.id === user.id)) {
      setMessageData(prev => ({
        ...prev,
        recipients: prev.recipients.filter((r: User) => r.id !== user.id)
      }));
    } else {
      setMessageData(prev => ({
        ...prev,
        recipients: [...prev.recipients, user]
      }));
    }
  };

  const handleRemoveRecipient = (userId: string) => {
    setMessageData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((r: User) => r.id !== userId)
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setMessageData(prev => ({
        ...prev,
        templateId,
        content: template.content,
        category: template.category,
        useTemplate: true
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newAttachments: Attachment[] = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }));

      setMessageData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (attachmentId: string | number) => {
    setMessageData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((a: Attachment) => a.id !== attachmentId)
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Validate recipients
    if (messageData.recipients.length === 0) {
      newErrors.recipients = 'At least one recipient is required';
    }

    // Validate subject
    if (!messageData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    // Validate content
    if (!messageData.content.trim()) {
      newErrors.content = 'Message content is required';
    }

    // Validate scheduled date/time
    if (!messageData.sendImmediate) {
      if (!messageData.scheduledDate) {
        newErrors.scheduledDate = 'Scheduled date is required';
      }
      if (!messageData.scheduledTime) {
        newErrors.scheduledTime = 'Scheduled time is required';
      }
      if (messageData.scheduledDate && messageData.scheduledTime) {
        const scheduledDateTime = new Date(`${messageData.scheduledDate}T${messageData.scheduledTime}`);
        if (scheduledDateTime <= new Date()) {
          newErrors.scheduledDate = 'Scheduled date/time must be in the future';
        }
      }
    }

    // Validate delivery methods
    if (!messageData.sendEmail && !messageData.sendSMS && !messageData.sendInApp) {
      newErrors.delivery = 'At least one delivery method must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const message = {
        ...messageData,
        messageId: `MSG${Date.now()}`,
        sentAt: new Date().toISOString(),
        sentBy: 'Admin User',
        status: messageData.sendImmediate ? 'Sent' : 'Scheduled',
        readCount: 0,
        replyCount: 0
      };
      
      onSend(message);
      
      // Reset form
      setMessageData({
        recipients: [], recipientType: 'individual', subject: '', content: '', category: 'general',
        priority: 'normal', attachments: [], sendImmediate: true, scheduledDate: '', scheduledTime: '',
        requestReadReceipt: false, allowReplies: true, useTemplate: false, templateId: '',
        sendEmail: true, sendSMS: false, sendInApp: true
      });
      setSelectedUsers([]);
      setSearchQuery('');
      
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'busy': return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'offline': return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
      default: return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Send className="h-5 w-5 mr-2 text-blue-600" />
              Compose Message
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Recipients Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Recipients</h4>
              
              {/* Selected Recipients */}
              {messageData.recipients.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {messageData.recipients.map((recipient: User) => (
                      <div key={recipient.id} className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        <div className={`w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2`}>
                          {recipient.avatar}
                        </div>
                        {recipient.name}
                        <button
                          onClick={() => handleRemoveRecipient(recipient.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.recipients && <p className="text-red-500 text-sm mb-2">{errors.recipients}</p>}

              {/* Search Users */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* User List */}
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelection(user)}
                    className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      messageData.recipients.find((r: User) => r.id === user.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm flex items-center justify-center mr-3`}>
                        {user.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email} • {user.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(user.status)}
                      {messageData.recipients.find((r: User) => r.id === user.id) && (
                        <CheckCircle className="h-4 w-4 text-blue-500 ml-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Details */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Message Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={messageData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {messageCategories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={messageData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={messageData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter message subject"
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Use Template</label>
                <select
                  value={messageData.templateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a template (optional)</option>
                  {messageTemplates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content *</label>
                <textarea
                  name="content"
                  value={messageData.content}
                  onChange={handleInputChange}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your message content..."
                />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Attachments</h4>
              
              <div className="mb-4">
                <label className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    ) : (
                      <>
                        <Paperclip className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload files or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                  />
                </label>
              </div>

              {messageData.attachments.length > 0 && (
                <div className="space-y-2">
                  {messageData.attachments.map((attachment: Attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between bg-white p-2 rounded border">
                      <div className="flex items-center">
                        <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{attachment.name}</div>
                          <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Options */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Delivery Options</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      name="sendImmediate"
                      checked={messageData.sendImmediate}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Send immediately</label>
                  </div>
                  
                  {!messageData.sendImmediate && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="date"
                          name="scheduledDate"
                          value={messageData.scheduledDate}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.scheduledDate && <p className="text-red-500 text-xs mt-1">{errors.scheduledDate}</p>}
                      </div>
                      <div>
                        <input
                          type="time"
                          name="scheduledTime"
                          value={messageData.scheduledTime}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            errors.scheduledTime ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.scheduledTime && <p className="text-red-500 text-xs mt-1">{errors.scheduledTime}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="sendEmail"
                      checked={messageData.sendEmail}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Send via Email</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="sendSMS"
                      checked={messageData.sendSMS}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Send via SMS</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="sendInApp"
                      checked={messageData.sendInApp}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Send in-app notification</label>
                  </div>
                  
                  {errors.delivery && <p className="text-red-500 text-xs mt-1">{errors.delivery}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requestReadReceipt"
                    checked={messageData.requestReadReceipt}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Request read receipt</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowReplies"
                    checked={messageData.allowReplies}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Allow replies</label>
                </div>
              </div>
            </div>

            {/* Preview */}
            {(messageData.subject || messageData.content) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Message Preview</h4>
                <div className="bg-white p-4 rounded border">
                  <div className="border-b border-gray-200 pb-2 mb-3">
                    <div className="text-sm font-medium text-gray-900">{messageData.subject || 'No Subject'}</div>
                    <div className="text-xs text-gray-500">
                      To: {messageData.recipients.length} recipient(s) • Priority: {messageData.priority} • Category: {messageData.category}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {messageData.content || 'No content'}
                  </div>
                  {messageData.attachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">{messageData.attachments.length} attachment(s)</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || messageData.recipients.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {messageData.sendImmediate ? 'Send Message' : 'Schedule Message'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
