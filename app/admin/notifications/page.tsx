"use client";

import { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Send,
  Settings,
  Users,
  Filter,
  RefreshCw,
  Trash2,
  MoreVertical,
  Search,
  Download,
  Calendar,
  X,
} from 'lucide-react';
import SendNotificationModal from '@/components/admin/modals/SendNotificationModal';

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    pending: 0,
    failed: 0,
    readRate: 0,
  });
  const [notificationsByType, setNotificationsByType] = useState({
    ORDER: 0,
    SERVICE: 0,
    MESSAGE: 0,
    PAYMENT: 0,
    SYSTEM: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();

      if (data.success) {
        // Transform notifications for display
        const transformed = data.notifications.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          channel: 'In-App', // Default channel
          recipient: n.user?.name || n.user?.email || 'User',
          recipientCount: 1,
          status: n.read ? 'Sent' : 'Pending',
          timestamp: new Date(n.createdAt).toLocaleString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          readCount: n.read ? 1 : 0,
          deliveryStatus: 'Delivered',
        }));
        setNotifications(transformed);

        // Calculate stats using data.stats
        setStats({
          totalSent: data.stats.total,
          pending: data.stats.unread,
          failed: 0,
          readRate: data.stats.total > 0 ? parseFloat(((data.stats.read / data.stats.total) * 100).toFixed(1)) : 0,
        });

        // Count by type
        const typeCounts = data.notifications.reduce((acc: any, n: any) => {
          acc[n.type] = (acc[n.type] || 0) + 1;
          return acc;
        }, {});
        setNotificationsByType({
          ORDER: typeCounts.ORDER || 0,
          SERVICE: typeCounts.SERVICE || 0,
          MESSAGE: typeCounts.MESSAGE || 0,
          PAYMENT: typeCounts.PAYMENT || 0,
          SYSTEM: typeCounts.SYSTEM || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [notifications, setNotifications] = useState<any[]>([]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sent':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      case 'Failed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</span>;
      case 'Scheduled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><Calendar className="w-3 h-3 mr-1" />Scheduled</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Booking':
        return <Bell className="h-4 w-4 text-primary-500" />;
      case 'Payment':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Job':
        return <Users className="h-4 w-4 text-primary-500" />;
      case 'Reminder':
        return <Clock className="h-4 w-4 text-primary-500" />;
      case 'Announcement':
        return <Bell className="h-4 w-4 text-primary-500" />;
      case 'Alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelIcons = (channel: string) => {
    const channels = channel.split(' + ');
    return (
      <div className="flex items-center space-x-1">
        {channels.map((ch, index) => (
          <div key={index} className="text-xs">
            {ch === 'Email' && <Mail className="h-3 w-3 text-primary-500" />}
            {ch === 'SMS' && <MessageSquare className="h-3 w-3 text-green-500" />}
            {ch === 'Push' && <Smartphone className="h-3 w-3 text-primary-500" />}
            {ch === 'In-App' && <Globe className="h-3 w-3 text-primary-500" />}
          </div>
        ))}
      </div>
    );
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    const matchesChannel = filterChannel === 'all' || notification.channel.includes(filterChannel);
    return matchesSearch && matchesType && matchesStatus && matchesChannel;
  });

  // Handle notification sent
  const handleNotificationSent = async (notificationData: any) => {
    try {
      // Send notification to API
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh notifications list
        await fetchNotifications();

        showToast(
          `Notification sent to ${result.data.count} recipient(s) successfully!`,
          'success'
        );
      } else {
        showToast(result.message || 'Failed to send notification', 'error');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      showToast('Failed to send notification', 'error');
    }
  };

  // Handle resend
  const handleResend = async (id: number) => {
    try {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: 'Pending', deliveryStatus: 'Resending' } : n
        )
      );
      showToast('Notification queued for resend', 'success');

      // Simulate API call
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, status: 'Sent', deliveryStatus: 'Delivered' } : n
          )
        );
        showToast('Notification resent successfully', 'success');
      }, 2000);
    } catch (error) {
      showToast('Failed to resend notification', 'error');
    } finally {
      setShowActionMenu(null);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this notification? This action cannot be undone.')) {
      try {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        showToast('Notification deleted successfully', 'success');

        // Update stats
        setStats(prev => ({
          ...prev,
          totalSent: prev.totalSent - 1,
        }));
      } catch (error) {
        showToast('Failed to delete notification', 'error');
      }
    }
    setShowActionMenu(null);
  };

  // Handle view details
  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    setShowActionMenu(null);
  };

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  const toggleSelectNotification = (id: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg p-6 text-gray-900 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Notifications Management</h1>
            <p className="text-gray-500 mt-2">Monitor and manage all platform notifications and communications</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Send className="h-4 w-4 mr-2" />
              Send New
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.totalSent.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.pending.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-full">
              <Clock className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.failed.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Read Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : `${stats.readRate}%`}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <Eye className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notification Types</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-4 w-4 text-primary-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Order Notifications</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {loading ? '-' : notificationsByType.ORDER.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Payment Notifications</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {loading ? '-' : notificationsByType.PAYMENT.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-primary-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Service Notifications</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {loading ? '-' : notificationsByType.SERVICE.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-primary-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">System Notifications</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {loading ? '-' : notificationsByType.SYSTEM.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="Booking">Booking</option>
              <option value="Payment">Payment</option>
              <option value="Job">Job</option>
              <option value="Reminder">Reminder</option>
              <option value="Announcement">Announcement</option>
              <option value="Alert">Alert</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Sent">Sent</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Scheduled">Scheduled</option>
            </select>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="Push">Push</option>
              <option value="In-App">In-App</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-700">
            {selectedNotifications.length} notification(s) selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
              Resend All
            </button>
            <button className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
              Delete All
            </button>
          </div>
        </div>
      )}

      {/* Notifications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications ({filteredNotifications.length})</h3>
            <button
              onClick={() => setShowSendModal(true)}
              className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send New
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notification Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Read by {notification.readCount} of {notification.recipientCount} recipients
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(notification.type)}
                      <span className="text-sm text-gray-900">{notification.type}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {getChannelIcons(notification.channel)}
                      <span className="text-xs text-gray-500 ml-1">{notification.channel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{notification.recipient}</div>
                    <div className="text-xs text-gray-500">{notification.recipientCount} user(s)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(notification.status)}
                      <div className="text-xs text-gray-500">{notification.deliveryStatus}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{notification.timestamp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === notification.id ? null : notification.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {showActionMenu === notification.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => handleViewDetails(notification)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleResend(notification.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Resend
                          </button>
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No notifications found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or send a new notification</p>
            <button
              onClick={() => setShowSendModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send New Notification
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredNotifications.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
              {filteredNotifications.length > 20 && (
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">2</button>
              )}
              {filteredNotifications.length > 40 && (
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">3</button>
              )}
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled={filteredNotifications.length <= 20}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={handleNotificationSent}
      />

      {/* Notification Details Modal */}
      {showDetailsModal && selectedNotification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDetailsModal(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <Bell className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Notification Details</h3>
                      <p className="text-sm text-gray-500">View full notification information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Status and Priority */}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    {getStatusBadge(selectedNotification.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Priority</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Normal
                    </span>
                  </div>
                  <div className="ml-auto">
                    <p className="text-sm text-gray-600">Ticket ID</p>
                    <p className="text-sm font-mono font-medium text-gray-900">#{selectedNotification.id}</p>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedNotification.title}</p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedNotification.message}</p>
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Type</label>
                    <p className="text-gray-900">{selectedNotification.recipient}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Recipients</label>
                    <p className="text-gray-900">{selectedNotification.recipientCount} user(s)</p>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
                    <div className="flex items-center gap-2">
                      {getChannelIcons(selectedNotification.channel)}
                      <span className="text-sm text-gray-900">{selectedNotification.channel}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(selectedNotification.type)}
                      <span className="text-sm text-gray-900">{selectedNotification.type}</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Engagement</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary-50 rounded-lg p-4">
                      <p className="text-sm text-primary-600 font-medium">Delivered</p>
                      <p className="text-2xl font-bold text-primary-900">{selectedNotification.recipientCount}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">Read</p>
                      <p className="text-2xl font-bold text-green-900">{selectedNotification.readCount}</p>
                    </div>
                    <div className="bg-primary-50 rounded-lg p-4">
                      <p className="text-sm text-primary-600 font-medium">Read Rate</p>
                      <p className="text-2xl font-bold text-primary-900">
                        {selectedNotification.recipientCount > 0
                          ? ((selectedNotification.readCount / selectedNotification.recipientCount) * 100).toFixed(0)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sent At</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {selectedNotification.timestamp}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Status</label>
                    <p className="text-gray-900">{selectedNotification.deliveryStatus}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      handleResend(selectedNotification.id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resend
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedNotification.id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
