'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ComposeMessageModal from '@/components/admin/modals/ComposeMessageModal';
import {
  Search,
  Filter,
  Download,
  Eye,
  Reply,
  MoreHorizontal,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Flag,
  Archive,
  Trash2,
  Send,
  Paperclip,
  Star
} from 'lucide-react';

export default function MessagesPage() {
  const [isComposeMessageModalOpen, setIsComposeMessageModalOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Expanded filter states
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attachmentFilter, setAttachmentFilter] = useState('All');

  const messages = [
    {
      id: 1,
      messageId: 'MSG001247',
      subject: 'Service Booking Inquiry',
      fromUser: 'Rahul Sharma',
      fromEmail: 'rahul.s@email.com',
      toUser: 'Sarah Johnson (Service Provider)',
      toEmail: 'sarah.j@email.com',
      message: 'Hi, I would like to book your home cleaning service for next week. Could you please let me know your availability?',
      timestamp: '2024-11-23 14:30',
      status: 'Unread',
      priority: 'Normal',
      category: 'Service Inquiry',
      hasAttachment: false,
      isStarred: true,
      conversationCount: 3,
      lastReply: '2024-11-23 15:45'
    },
    {
      id: 2,
      messageId: 'MSG001248',
      subject: 'Payment Issue',
      fromUser: 'Priya Patel',
      fromEmail: 'priya.p@email.com',
      toUser: 'Support Team',
      toEmail: 'support@connect.com',
      message: 'I am facing an issue with payment processing. The transaction failed but the amount was deducted from my account.',
      timestamp: '2024-11-23 12:15',
      status: 'Read',
      priority: 'High',
      category: 'Support',
      hasAttachment: true,
      isStarred: false,
      conversationCount: 5,
      lastReply: '2024-11-23 16:20'
    },
    {
      id: 3,
      messageId: 'MSG001249',
      subject: 'Job Application Follow-up',
      fromUser: 'Amit Kumar',
      fromEmail: 'amit.k@email.com',
      toUser: 'Tech Solutions Inc.',
      toEmail: 'hr@techsolutions.com',
      message: 'I wanted to follow up on my job application for the Senior React Developer position. Could you please provide an update?',
      timestamp: '2024-11-23 10:45',
      status: 'Replied',
      priority: 'Normal',
      category: 'Job Application',
      hasAttachment: false,
      isStarred: false,
      conversationCount: 2,
      lastReply: '2024-11-23 11:30'
    },
    {
      id: 4,
      messageId: 'MSG001250',
      subject: 'Service Complaint',
      fromUser: 'Neha Singh',
      fromEmail: 'neha.s@email.com',
      toUser: 'Mike Rodriguez (Service Provider)',
      toEmail: 'mike.r@email.com',
      message: 'The plumbing service was not completed properly. There are still issues with the kitchen sink.',
      timestamp: '2024-11-23 09:20',
      status: 'Flagged',
      priority: 'High',
      category: 'Complaint',
      hasAttachment: true,
      isStarred: true,
      conversationCount: 7,
      lastReply: '2024-11-23 17:10'
    },
    {
      id: 5,
      messageId: 'MSG001251',
      subject: 'Account Verification',
      fromUser: 'Alex Thompson',
      fromEmail: 'alex.t@email.com',
      toUser: 'Admin Team',
      toEmail: 'admin@connect.com',
      message: 'I need help with account verification. I have uploaded all required documents but my account is still pending.',
      timestamp: '2024-11-22 18:30',
      status: 'Archived',
      priority: 'Normal',
      category: 'Account',
      hasAttachment: true,
      isStarred: false,
      conversationCount: 1,
      lastReply: null
    }
  ];

  // Filtering logic
  const filteredMessages = messages.filter(msg => {
    // Search query check
    const matchesSearch = !searchQuery ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.fromUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.toUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.messageId.toLowerCase().includes(searchQuery.toLowerCase());

    // Status check
    const matchesStatus = statusFilter === 'All Status' || msg.status === statusFilter;

    // Category check
    const matchesCategory = categoryFilter === 'All Categories' || msg.category === categoryFilter;

    // Priority check
    const matchesPriority = priorityFilter === 'All Priorities' || msg.priority === priorityFilter;

    // Date check
    const msgDate = new Date(msg.timestamp);
    const matchesStartDate = !startDate || msgDate >= new Date(startDate);
    const matchesEndDate = !endDate || msgDate <= new Date(endDate);

    // Attachment check
    const matchesAttachment = attachmentFilter === 'All' ||
      (attachmentFilter === 'Yes' && msg.hasAttachment) ||
      (attachmentFilter === 'No' && !msg.hasAttachment);

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesStartDate && matchesEndDate && matchesAttachment;
  });

  const handleComposeMessage = (messageData: any) => {
    console.log('Composing message:', messageData);

    // Simulate message sending
    setTimeout(() => {
      alert(`Message "${messageData.subject}" has been ${messageData.status === 'Sent' ? 'sent' : 'scheduled'} successfully!\n\nDetails:\n- Recipients: ${messageData.recipients.length}\n- Message ID: ${messageData.messageId}\n- Priority: ${messageData.priority}\n- Category: ${messageData.category}`);
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Unread':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><MessageSquare className="w-3 h-3 mr-1" />Unread</span>;
      case 'Read':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Read</span>;
      case 'Replied':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><Reply className="w-3 h-3 mr-1" />Replied</span>;
      case 'Flagged':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><Flag className="w-3 h-3 mr-1" />Flagged</span>;
      case 'Archived':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><Archive className="w-3 h-3 mr-1" />Archived</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">High</span>;
      case 'Normal':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Normal</span>;
      case 'Low':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Low</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Normal</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Messages Management</h1>
          <p className="text-primary-100 mt-2">Monitor and manage all platform communications and messages</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">18,456</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">+14.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">847</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <AlertCircle className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600 font-medium">+8.5%</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Flagged Messages</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Flag className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600 font-medium">+3</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">2.5h</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">-0.5h</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>
        </div>

        {/* Message Categories Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Message Categories</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">5,247</div>
                <div className="text-sm text-gray-600">Service Inquiries</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">3,892</div>
                <div className="text-sm text-gray-600">Job Applications</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary-600">2,156</div>
                <div className="text-sm text-gray-600">Support Requests</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-600">1,847</div>
                <div className="text-sm text-gray-600">Account Issues</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">892</div>
                <div className="text-sm text-gray-600">Complaints</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">4,422</div>
                <div className="text-sm text-gray-600">Others</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>All Status</option>
                  <option>Unread</option>
                  <option>Read</option>
                  <option>Replied</option>
                  <option>Flagged</option>
                  <option>Archived</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option>All Categories</option>
                  <option>Service Inquiry</option>
                  <option>Job Application</option>
                  <option>Support</option>
                  <option>Complaint</option>
                  <option>Account</option>
                </select>
                <button
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${showMoreFilters ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Selected
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showMoreFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option>All Priorities</option>
                    <option>High</option>
                    <option>Normal</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date Range (From)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date Range (To)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Has Attachments</label>
                  <select
                    value={attachmentFilter}
                    onChange={(e) => setAttachmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option>All</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="lg:col-span-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All Status');
                      setCategoryFilter('All Categories');
                      setPriorityFilter('All Priorities');
                      setStartDate('');
                      setEndDate('');
                      setAttachmentFilter('All');
                    }}
                    className="text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Messages ({filteredMessages.length})</h3>
              <button
                onClick={() => setIsComposeMessageModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Compose Message
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From / Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To / Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No messages found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                          {message.isStarred && <Star className="h-4 w-4 text-slate-400 fill-current" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">{message.subject}</div>
                            {message.hasAttachment && <Paperclip className="h-3 w-3 text-gray-400" />}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">{message.message}</div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span>{message.messageId}</span>
                            <span>Conversation: {message.conversationCount} messages</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">From: {message.fromUser}</div>
                          <div className="text-sm text-gray-500">{message.fromEmail}</div>
                          <div className="text-sm text-gray-500 mt-1">To: {message.toUser}</div>
                          <div className="text-xs text-gray-400">{message.timestamp}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {message.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(message.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(message.status)}
                          {message.lastReply && (
                            <div className="text-xs text-gray-500">
                              Last reply: {message.lastReply}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-primary-600 hover:text-primary-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Reply className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Flag className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
              <span className="font-medium">18,456</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                1
              </button>
              {messages.length > 10 && (
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  2
                </button>
              )}
              {messages.length > 20 && (
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  3
                </button>
              )}
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled={messages.length <= 10}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Message Modal */}
      <ComposeMessageModal
        isOpen={isComposeMessageModalOpen}
        onClose={() => setIsComposeMessageModalOpen(false)}
        onSend={handleComposeMessage}
      />
    </AdminLayout>
  );
}
