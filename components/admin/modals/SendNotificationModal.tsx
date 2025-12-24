'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Users,
  User,
  Bell,
  Clock,
  CheckCircle,
  DollarSign,
  Briefcase,
  AlertTriangle,
  Megaphone,
  Calendar,
  Search,
  Plus,
  Trash2,
  FileText,
  ShoppingBag,
  Package,
  Building2,
} from 'lucide-react';

interface Recipient {
  id: string;
  name: string;
  email: string;
  type: string;
  avatar: string;
}

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (notificationData: any) => void;
}

export default function SendNotificationModal({
  isOpen,
  onClose,
  onSend,
}: SendNotificationModalProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [notificationData, setNotificationData] = useState({
    // Recipient settings
    recipientType: 'individual', // 'individual', 'group', 'broadcast'
    selectedRecipients: [] as Recipient[],
    targetUserTypes: [] as string[],
    
    // Notification content
    title: '',
    message: '',
    notificationType: 'announcement', // 'booking', 'payment', 'job', 'reminder', 'announcement', 'alert', 'promotion'
    priority: 'normal', // 'low', 'normal', 'high', 'urgent'
    
    // Delivery channels
    channels: {
      email: true,
      sms: false,
      push: true,
      inApp: true,
    },
    
    // Scheduling
    sendNow: true,
    scheduledDate: '',
    scheduledTime: '',
    
    // Additional options
    requireConfirmation: false,
    trackOpens: true,
    includeActionButton: false,
    actionButtonText: '',
    actionButtonUrl: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState<Recipient[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        // Transform users for display
        const transformedUsers = data.users.map((user: any) => ({
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          type: user.userType || 'User',
          avatar: (user.name || user.email).substring(0, 2).toUpperCase(),
        }));
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const userTypes = [
    { id: 'BUYER', label: 'Buyers', icon: ShoppingBag, count: 8500, color: 'blue' },
    { id: 'VENDOR', label: 'Vendors', icon: Package, count: 1200, color: 'green' },
    { id: 'COMPANY', label: 'Companies', icon: Building2, count: 1245, color: 'purple' },
    { id: 'JOB_SEEKER', label: 'Job Seekers', icon: Briefcase, count: 1000, color: 'indigo' },
  ];

  const notificationTypes = [
    { id: 'announcement', label: 'Announcement', icon: Megaphone, color: 'blue' },
    { id: 'alert', label: 'Alert', icon: AlertTriangle, color: 'red' },
    { id: 'promotion', label: 'Promotion', icon: DollarSign, color: 'green' },
    { id: 'reminder', label: 'Reminder', icon: Clock, color: 'orange' },
    { id: 'booking', label: 'Booking Update', icon: Calendar, color: 'purple' },
    { id: 'payment', label: 'Payment Update', icon: CheckCircle, color: 'emerald' },
    { id: 'job', label: 'Job Update', icon: Briefcase, color: 'indigo' },
    { id: 'system', label: 'System Notice', icon: Bell, color: 'gray' },
  ];

  const templates = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      title: 'Welcome to Connect Platform!',
      message: 'Thank you for joining Connect Platform. We\'re excited to have you on board! Explore our services, products, and job opportunities.',
      type: 'announcement',
    },
    {
      id: 'maintenance',
      name: 'Scheduled Maintenance',
      title: 'Scheduled Maintenance Notice',
      message: 'We will be performing scheduled maintenance on [DATE] from [TIME] to [TIME]. Some services may be temporarily unavailable.',
      type: 'alert',
    },
    {
      id: 'promotion',
      name: 'Special Offer',
      title: 'Special Offer Just for You!',
      message: 'Get [X]% off on all services this weekend! Use code [CODE] at checkout. Limited time offer.',
      type: 'promotion',
    },
    {
      id: 'new-feature',
      name: 'New Feature Announcement',
      title: 'Exciting New Feature!',
      message: 'We\'ve just launched [FEATURE NAME]! Now you can [FEATURE BENEFIT]. Try it out today.',
      type: 'announcement',
    },
    {
      id: 'policy-update',
      name: 'Policy Update',
      title: 'Important Policy Update',
      message: 'We\'ve updated our [POLICY NAME]. Please review the changes that take effect on [DATE].',
      type: 'system',
    },
  ];

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setNotificationData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setNotificationData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleChannelToggle = (channel: keyof typeof notificationData.channels) => {
    setNotificationData((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const handleUserTypeToggle = (typeId: string) => {
    setNotificationData((prev) => ({
      ...prev,
      targetUserTypes: prev.targetUserTypes.includes(typeId)
        ? prev.targetUserTypes.filter((t) => t !== typeId)
        : [...prev.targetUserTypes, typeId],
    }));
  };

  const handleRecipientToggle = (user: Recipient) => {
    setNotificationData((prev) => ({
      ...prev,
      selectedRecipients: prev.selectedRecipients.find((r) => r.id === user.id)
        ? prev.selectedRecipients.filter((r) => r.id !== user.id)
        : [...prev.selectedRecipients, user],
    }));
  };

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setNotificationData((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
      notificationType: template.type,
    }));
  };

  const getRecipientCount = () => {
    if (notificationData.recipientType === 'individual') {
      return notificationData.selectedRecipients.length;
    } else if (notificationData.recipientType === 'group') {
      return notificationData.targetUserTypes.reduce((acc, typeId) => {
        const userType = userTypes.find((t) => t.id === typeId);
        return acc + (userType?.count || 0);
      }, 0);
    } else {
      return userTypes.reduce((acc, type) => acc + type.count, 0);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (notificationData.recipientType === 'individual' && notificationData.selectedRecipients.length === 0) {
        newErrors.recipients = 'Please select at least one recipient';
      }
      if (notificationData.recipientType === 'group' && notificationData.targetUserTypes.length === 0) {
        newErrors.userTypes = 'Please select at least one user type';
      }
    }

    if (step === 2) {
      if (!notificationData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!notificationData.message.trim()) {
        newErrors.message = 'Message is required';
      }
    }

    if (step === 3) {
      const hasChannel = Object.values(notificationData.channels).some((v) => v);
      if (!hasChannel) {
        newErrors.channels = 'Please select at least one delivery channel';
      }
      if (!notificationData.sendNow) {
        if (!notificationData.scheduledDate) {
          newErrors.scheduledDate = 'Please select a date';
        }
        if (!notificationData.scheduledTime) {
          newErrors.scheduledTime = 'Please select a time';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSend = async () => {
    if (!validateStep(3)) return;

    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notification = {
        ...notificationData,
        id: `NOTIF-${Date.now()}`,
        sentAt: notificationData.sendNow ? new Date().toISOString() : null,
        scheduledAt: !notificationData.sendNow
          ? `${notificationData.scheduledDate}T${notificationData.scheduledTime}`
          : null,
        status: notificationData.sendNow ? 'Sent' : 'Scheduled',
        recipientCount: getRecipientCount(),
        createdBy: 'Admin',
      };

      onSend(notification);
      onClose();

      // Reset form
      setNotificationData({
        recipientType: 'individual',
        selectedRecipients: [],
        targetUserTypes: [],
        title: '',
        message: '',
        notificationType: 'announcement',
        priority: 'normal',
        channels: { email: true, sms: false, push: true, inApp: true },
        sendNow: true,
        scheduledDate: '',
        scheduledTime: '',
        requireConfirmation: false,
        trackOpens: true,
        includeActionButton: false,
        actionButtonText: '',
        actionButtonUrl: '',
      });
      setActiveStep(1);
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsSending(false);
    }
  };

  const steps = [
    { id: 1, name: 'Recipients', icon: Users },
    { id: 2, name: 'Content', icon: FileText },
    { id: 3, name: 'Delivery', icon: Send },
    { id: 4, name: 'Review', icon: CheckCircle },
  ];

  const getTypeColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      gray: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Send Notification</h3>
                  <p className="text-sm text-indigo-200">Create and send notifications to users</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps */}
            <div className="mt-6 flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;
                const isCompleted = activeStep > step.id;
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white text-indigo-600'
                          : isCompleted
                          ? 'bg-white/30 text-white'
                          : 'text-white/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">{step.name}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 sm:w-16 h-0.5 mx-2 ${
                          isCompleted ? 'bg-white/50' : 'bg-white/20'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Recipients */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Select Recipients</h4>
                  
                  {/* Recipient Type Selection */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { id: 'individual', label: 'Individual Users', icon: User, desc: 'Select specific users' },
                      { id: 'group', label: 'User Groups', icon: Users, desc: 'Target by user type' },
                      { id: 'broadcast', label: 'Broadcast All', icon: Megaphone, desc: 'Send to everyone' },
                    ].map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setNotificationData((prev) => ({ ...prev, recipientType: type.id }))}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            notificationData.recipientType === type.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mb-2 ${
                            notificationData.recipientType === type.id ? 'text-indigo-600' : 'text-gray-400'
                          }`} />
                          <p className="font-medium text-gray-900">{type.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Individual Selection */}
                  {notificationData.recipientType === 'individual' && (
                    <div>
                      {/* Selected Recipients */}
                      {notificationData.selectedRecipients.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Selected ({notificationData.selectedRecipients.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {notificationData.selectedRecipients.map((recipient) => (
                              <div
                                key={recipient.id}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                              >
                                <div className="w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {recipient.avatar}
                                </div>
                                {recipient.name}
                                <button
                                  onClick={() => handleRecipientToggle(recipient)}
                                  className="hover:text-indigo-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search users..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      {/* User List */}
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleRecipientToggle(user)}
                            className={`flex items-center justify-between p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                              notificationData.selectedRecipients.find((r) => r.id === user.id)
                                ? 'bg-indigo-50'
                                : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {user.avatar}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email} • {user.type}</p>
                              </div>
                            </div>
                            {notificationData.selectedRecipients.find((r) => r.id === user.id) && (
                              <CheckCircle className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                        ))}
                      </div>
                      {errors.recipients && (
                        <p className="text-red-500 text-sm mt-2">{errors.recipients}</p>
                      )}
                    </div>
                  )}

                  {/* Group Selection */}
                  {notificationData.recipientType === 'group' && (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">Select user types to target:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {userTypes.map((type) => {
                          const Icon = type.icon;
                          const isSelected = notificationData.targetUserTypes.includes(type.id);
                          return (
                            <button
                              key={type.id}
                              onClick={() => handleUserTypeToggle(type.id)}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                isSelected
                                  ? `border-${type.color}-500 bg-${type.color}-50`
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <Icon className={`w-5 h-5 ${isSelected ? `text-${type.color}-600` : 'text-gray-400'}`} />
                                {isSelected && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </div>
                              <p className="font-medium text-gray-900 mt-2">{type.label}</p>
                              <p className="text-sm text-gray-500">{type.count.toLocaleString()} users</p>
                            </button>
                          );
                        })}
                      </div>
                      {errors.userTypes && (
                        <p className="text-red-500 text-sm mt-2">{errors.userTypes}</p>
                      )}
                    </div>
                  )}

                  {/* Broadcast Info */}
                  {notificationData.recipientType === 'broadcast' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Broadcast to All Users</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            This notification will be sent to all {userTypes.reduce((acc, t) => acc + t.count, 0).toLocaleString()} users on the platform.
                            Please review carefully before sending.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recipient Count */}
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Recipients</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {getRecipientCount().toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Step 2: Content */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Content</h4>

                  {/* Templates */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Templates
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notification Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {notificationTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = notificationData.notificationType === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setNotificationData((prev) => ({ ...prev, notificationType: type.id }))}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              isSelected
                                ? `${getTypeColor(type.color)} border-current`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-xs font-medium">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={notificationData.title}
                      onChange={handleInputChange}
                      placeholder="Enter notification title"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={notificationData.message}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Enter notification message..."
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      {notificationData.message.length}/500 characters
                    </p>
                  </div>

                  {/* Priority */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {['low', 'normal', 'high', 'urgent'].map((priority) => (
                        <button
                          key={priority}
                          onClick={() => setNotificationData((prev) => ({ ...prev, priority }))}
                          className={`px-4 py-2 rounded-lg border capitalize transition-colors ${
                            notificationData.priority === priority
                              ? priority === 'urgent'
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : priority === 'high'
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        name="includeActionButton"
                        checked={notificationData.includeActionButton}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Include Action Button
                      </label>
                    </div>
                    {notificationData.includeActionButton && (
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="actionButtonText"
                          value={notificationData.actionButtonText}
                          onChange={handleInputChange}
                          placeholder="Button Text (e.g., Learn More)"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <input
                          type="url"
                          name="actionButtonUrl"
                          value={notificationData.actionButtonUrl}
                          onChange={handleInputChange}
                          placeholder="Button URL"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Delivery */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Settings</h4>

                  {/* Channels */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Delivery Channels
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'email', label: 'Email', icon: Mail, color: 'blue' },
                        { id: 'sms', label: 'SMS', icon: MessageSquare, color: 'green' },
                        { id: 'push', label: 'Push', icon: Smartphone, color: 'purple' },
                        { id: 'inApp', label: 'In-App', icon: Globe, color: 'orange' },
                      ].map((channel) => {
                        const Icon = channel.icon;
                        const isSelected = notificationData.channels[channel.id as keyof typeof notificationData.channels];
                        return (
                          <button
                            key={channel.id}
                            onClick={() => handleChannelToggle(channel.id as keyof typeof notificationData.channels)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                              isSelected
                                ? `${getTypeColor(channel.color)} border-current`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">{channel.label}</span>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 mx-auto mt-2 text-green-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {errors.channels && (
                      <p className="text-red-500 text-sm mt-2">{errors.channels}</p>
                    )}
                  </div>

                  {/* Scheduling */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      When to Send
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={() => setNotificationData((prev) => ({ ...prev, sendNow: true }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          notificationData.sendNow
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Send className={`w-5 h-5 mb-2 ${notificationData.sendNow ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <p className="font-medium text-gray-900">Send Now</p>
                        <p className="text-xs text-gray-500">Send immediately</p>
                      </button>
                      <button
                        onClick={() => setNotificationData((prev) => ({ ...prev, sendNow: false }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          !notificationData.sendNow
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Calendar className={`w-5 h-5 mb-2 ${!notificationData.sendNow ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <p className="font-medium text-gray-900">Schedule</p>
                        <p className="text-xs text-gray-500">Send at specific time</p>
                      </button>
                    </div>

                    {!notificationData.sendNow && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            name="scheduledDate"
                            value={notificationData.scheduledDate}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.scheduledDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.scheduledDate}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                          <input
                            type="time"
                            name="scheduledTime"
                            value={notificationData.scheduledTime}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              errors.scheduledTime ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.scheduledTime && (
                            <p className="text-red-500 text-xs mt-1">{errors.scheduledTime}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Options */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Options</h5>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="trackOpens"
                        checked={notificationData.trackOpens}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">Track opens and clicks</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="requireConfirmation"
                        checked={notificationData.requireConfirmation}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">Require read confirmation</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {activeStep === 4 && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Review & Confirm</h4>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-indigo-600 font-medium">Recipients</p>
                    <p className="text-2xl font-bold text-indigo-900">{getRecipientCount().toLocaleString()}</p>
                    <p className="text-xs text-indigo-600 mt-1">
                      {notificationData.recipientType === 'individual'
                        ? 'Selected users'
                        : notificationData.recipientType === 'group'
                        ? notificationData.targetUserTypes.map((t) => userTypes.find((ut) => ut.id === t)?.label).join(', ')
                        : 'All users'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Delivery</p>
                    <p className="text-lg font-bold text-green-900">
                      {notificationData.sendNow ? 'Immediate' : 'Scheduled'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {Object.entries(notificationData.channels)
                        .filter(([_, v]) => v)
                        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                        .join(', ')}
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Notification Preview</p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(
                        notificationTypes.find((t) => t.id === notificationData.notificationType)?.color || 'gray'
                      )}`}>
                        {(() => {
                          const Icon = notificationTypes.find((t) => t.id === notificationData.notificationType)?.icon || Bell;
                          return <Icon className="w-5 h-5" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{notificationData.title || 'Untitled'}</p>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                            notificationData.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : notificationData.priority === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {notificationData.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                          {notificationData.message || 'No message content'}
                        </p>
                        {notificationData.includeActionButton && notificationData.actionButtonText && (
                          <button className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">
                            {notificationData.actionButtonText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Info */}
                {!notificationData.sendNow && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Scheduled for</p>
                        <p className="text-sm text-yellow-700">
                          {notificationData.scheduledDate} at {notificationData.scheduledTime}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={activeStep === 1 ? onClose : handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {activeStep === 1 ? 'Cancel' : 'Back'}
            </button>
            <div className="flex items-center gap-3">
              {activeStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {notificationData.sendNow ? 'Send Now' : 'Schedule'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
