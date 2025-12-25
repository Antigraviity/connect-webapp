'use client';

import { useState } from 'react';
import { X, Send, Mail, Paperclip, Trash2, AlertCircle } from 'lucide-react';

// User type definition
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'BUYER' | 'VENDOR' | 'SELLER' | 'COMPANY' | 'JOB_SEEKER' | 'EMPLOYER' | 'USER';
  location: string;
  joinDate: string;
  lastActive: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  avatar: string;
}

interface Attachment {
  id: string | number;
  name: string;
  size: number;
  type: string;
}

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onSend: (emailData: any) => void;
}

export default function SendEmailModal({
  isOpen,
  onClose,
  user,
  onSend,
}: SendEmailModalProps) {
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    template: '',
    attachments: [] as Attachment[],
    sendCopy: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !user) return null;

  // Email templates based on user type
  const getTemplatesForUserType = (type: string) => {
    const commonTemplates = [
      { id: 'welcome', name: 'Welcome Message', subject: 'Welcome to Connect Platform!' },
      { id: 'account-update', name: 'Account Update', subject: 'Your Account Has Been Updated' },
      { id: 'security', name: 'Security Alert', subject: 'Important Security Notice' },
      { id: 'custom', name: 'Custom Message', subject: '' },
    ];

    const typeSpecificTemplates: Record<string, Array<{ id: string; name: string; subject: string }>> = {
      BUYER: [
        { id: 'order-confirmation', name: 'Order Confirmation', subject: 'Your Order Has Been Confirmed' },
        { id: 'shipping-update', name: 'Shipping Update', subject: 'Your Order is On Its Way!' },
        { id: 'special-offer', name: 'Special Offer', subject: 'Exclusive Offer Just for You!' },
      ],
      VENDOR: [
        { id: 'service-approved', name: 'Service Approved', subject: 'Your Service Has Been Approved' },
        { id: 'payment-received', name: 'Payment Received', subject: 'Payment Received Successfully' },
        { id: 'new-booking', name: 'New Booking Alert', subject: 'You Have a New Booking!' },
      ],
      SELLER: [
        { id: 'product-approved', name: 'Product Approved', subject: 'Your Product Has Been Approved' },
        { id: 'sales-report', name: 'Sales Report', subject: 'Your Weekly Sales Report' },
        { id: 'inventory-alert', name: 'Inventory Alert', subject: 'Low Inventory Alert' },
      ],
      COMPANY: [
        { id: 'job-posted', name: 'Job Posted', subject: 'Your Job Has Been Posted Successfully' },
        { id: 'applicant-alert', name: 'New Applicant', subject: 'New Application Received' },
        { id: 'hiring-update', name: 'Hiring Update', subject: 'Update on Your Job Posting' },
      ],
      JOB_SEEKER: [
        { id: 'application-received', name: 'Application Received', subject: 'Your Application Has Been Received' },
        { id: 'interview-invite', name: 'Interview Invitation', subject: 'Interview Invitation - Next Steps' },
        { id: 'job-recommendation', name: 'Job Recommendation', subject: 'Jobs That Match Your Profile' },
      ],
    };

    return [...(typeSpecificTemplates[type] || []), ...commonTemplates];
  };

  // Template content based on template id
  const getTemplateContent = (templateId: string, userName: string) => {
    const templates: Record<string, string> = {
      welcome: `Dear ${userName},

Welcome to Connect Platform! We're excited to have you join our community.

Here's what you can do next:
- Complete your profile
- Explore our services and products
- Connect with other users

If you have any questions, feel free to reach out to our support team.

Best regards,
The Connect Platform Team`,

      'order-confirmation': `Dear ${userName},

Thank you for your order! We've received your order and it's being processed.

You can track your order status in your dashboard. We'll notify you once it's shipped.

Thank you for shopping with us!

Best regards,
The Connect Platform Team`,

      'service-approved': `Dear ${userName},

Great news! Your service has been approved and is now live on our platform.

You can start receiving bookings immediately. Make sure your availability is up to date.

Best regards,
The Connect Platform Team`,

      'product-approved': `Dear ${userName},

Your product listing has been approved and is now visible to buyers.

Tips for better sales:
- Add high-quality images
- Write detailed descriptions
- Price competitively

Best regards,
The Connect Platform Team`,

      'job-posted': `Dear ${userName},

Your job posting is now live on Connect Platform!

Tips for attracting great candidates:
- Make sure job description is detailed
- Respond to applications promptly
- Keep salary expectations realistic

Best regards,
The Connect Platform Team`,

      'application-received': `Dear ${userName},

Thank you for applying! We've received your application and the employer will review it shortly.

In the meantime, you can:
- Update your resume
- Add more skills to your profile
- Apply to similar positions

Best regards,
The Connect Platform Team`,

      'interview-invite': `Dear ${userName},

Congratulations! The employer would like to invite you for an interview.

Please log in to your dashboard to see the details and confirm your availability.

Best of luck!

Best regards,
The Connect Platform Team`,

      'account-update': `Dear ${userName},

This is to confirm that your account information has been updated successfully.

If you did not make this change, please contact our support team immediately.

Best regards,
The Connect Platform Team`,

      'security': `Dear ${userName},

We noticed some unusual activity on your account. For your security, please verify your recent actions.

If you didn't perform these actions, please:
1. Change your password immediately
2. Contact our support team

Your security is our priority.

Best regards,
The Connect Platform Team`,

      custom: '',
    };

    return templates[templateId] || '';
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setEmailData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setEmailData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const templates = getTemplatesForUserType(user.type);
    const selectedTemplate = templates.find((t) => t.id === templateId);

    if (selectedTemplate) {
      setEmailData((prev) => ({
        ...prev,
        template: templateId,
        subject: selectedTemplate.subject || prev.subject,
        content: getTemplateContent(templateId, user.name),
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newAttachments: Attachment[] = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      setEmailData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments],
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (attachmentId: string | number) => {
    setEmailData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== attachmentId),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!emailData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!emailData.content.trim()) newErrors.content = 'Email content is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const email = {
        ...emailData,
        to: user.email,
        toName: user.name,
        userId: user.id,
        userType: user.type,
        sentAt: new Date().toISOString(),
        status: 'Sent',
      };

      onSend(email);

      // Reset form
      setEmailData({
        subject: '',
        content: '',
        template: '',
        attachments: [],
        sendCopy: false,
      });

      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const templates = getTemplatesForUserType(user.type);

  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case 'BUYER':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Buyer' };
      case 'VENDOR':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Vendor' };
      case 'SELLER':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Seller' };
      case 'COMPANY':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Company' };
      case 'JOB_SEEKER':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Job Seeker' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: type };
    }
  };

  const typeBadge = getUserTypeBadge(user.type);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Send Email</h3>
                  <p className="text-sm text-blue-200">Compose and send email to user</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Recipient Info */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeBadge.bg} ${typeBadge.text}`}
                  >
                    {typeBadge.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Template
              </label>
              <select
                value={emailData.template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a template (optional)</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Templates are customized based on user type ({typeBadge.label})
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={emailData.subject}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email subject"
              />
              {errors.subject && (
                <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="content"
                value={emailData.content}
                onChange={handleInputChange}
                rows={10}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your message..."
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content}</p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    ) : (
                      <>
                        <Paperclip className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Click to upload or drag and drop
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                </label>
              </div>

              {emailData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {emailData.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="sendCopy"
                checked={emailData.sendCopy}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                Send me a copy of this email
              </label>
            </div>

            {/* Info Notice */}
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Email will be sent to:</p>
                <p>{user.email}</p>
                <p className="mt-2 text-xs text-blue-600">
                  The email will be sent from noreply@connectplatform.com
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
