'use client';

import { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Shield,
  ShoppingBag,
  Package,
  Briefcase,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Building2,
  User,
  CreditCard,
  Activity,
  Settings,
} from 'lucide-react';

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
  // Type-specific fields
  orders?: number;
  spent?: string;
  services?: number;
  earnings?: string;
  rating?: number;
  jobs?: number;
  hires?: number;
  products?: number;
  sales?: string;
  applications?: number;
  interviews?: number;
  // Additional details
  bio?: string;
  skills?: string[];
  companySize?: string;
  industry?: string;
  website?: string;
  verified?: boolean;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  onEdit?: (user: UserData) => void;
  onSendEmail?: (user: UserData) => void;
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
  onEdit,
  onSendEmail,
}: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'SUSPENDED':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      case 'INACTIVE':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
    }
  };

  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case 'BUYER':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Buyer', icon: ShoppingBag };
      case 'VENDOR':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Vendor', icon: Package };
      case 'SELLER':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Seller', icon: Package };
      case 'COMPANY':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Company', icon: Building2 };
      case 'JOB_SEEKER':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Job Seeker', icon: Briefcase };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: type, icon: User };
    }
  };

  const statusBadge = getStatusBadge(user.status);
  const typeBadge = getUserTypeBadge(user.type);
  const StatusIcon = statusBadge.icon;
  const TypeIcon = typeBadge.icon;

  // Type-specific stats
  const renderTypeSpecificStats = () => {
    switch (user.type) {
      case 'BUYER':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm font-medium">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.orders || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Total Spent</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.spent || '₹0'}</p>
            </div>
          </div>
        );

      case 'VENDOR':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Services</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.services || 0}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Earnings</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.earnings || '₹0'}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Rating</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.rating || 0}/5</p>
            </div>
          </div>
        );

      case 'SELLER':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Products</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.products || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Sales</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.sales || '₹0'}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Rating</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.rating || 0}/5</p>
            </div>
          </div>
        );

      case 'COMPANY':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Jobs Posted</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.jobs || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Total Hires</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.hires || 0}</p>
            </div>
          </div>
        );

      case 'JOB_SEEKER':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Applications</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.applications || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Interviews</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.interviews || 0}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Type-specific additional info
  const renderTypeSpecificInfo = () => {
    switch (user.type) {
      case 'VENDOR':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Services Offered</h4>
            <div className="flex flex-wrap gap-2">
              {['Web Development', 'UI/UX Design', 'Mobile Apps', 'Consulting'].map((service, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        );

      case 'SELLER':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Product Categories</h4>
            <div className="flex flex-wrap gap-2">
              {['Electronics', 'Home & Garden', 'Fashion'].map((category, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        );

      case 'COMPANY':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Company Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Industry:</span>
                  <span className="ml-2 text-gray-900">{user.industry || 'Technology'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Company Size:</span>
                  <span className="ml-2 text-gray-900">{user.companySize || '50-200 employees'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Website:</span>
                  <a
                    href={user.website || '#'}
                    className="ml-2 text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.website || 'www.company.com'}
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Active Job Postings</h4>
              <div className="space-y-2">
                {['Senior Developer', 'Product Manager', 'UI Designer'].map((job, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-700">{job}</span>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'JOB_SEEKER':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(user.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']).map(
                  (skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Applications</h4>
              <div className="space-y-2">
                {[
                  { company: 'TechCorp', position: 'Senior Developer', status: 'Interview' },
                  { company: 'StartupXYZ', position: 'Full Stack Dev', status: 'Applied' },
                  { company: 'BigTech Inc', position: 'Backend Engineer', status: 'Rejected' },
                ].map((app, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{app.position}</p>
                      <p className="text-xs text-gray-500">{app.company}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        app.status === 'Interview'
                          ? 'bg-green-100 text-green-700'
                          : app.status === 'Applied'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'BUYER':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Orders</h4>
              <div className="space-y-2">
                {[
                  { id: 'ORD-001', item: 'Electronics Package', amount: '₹5,600', status: 'Delivered' },
                  { id: 'ORD-002', item: 'Home Decor Set', amount: '₹2,400', status: 'In Transit' },
                  { id: 'ORD-003', item: 'Service Booking', amount: '₹1,500', status: 'Completed' },
                ].map((order, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.item}</p>
                      <p className="text-xs text-gray-500">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                      <span
                        className={`text-xs ${
                          order.status === 'Delivered' || order.status === 'Completed'
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {user.name}
                    {user.verified && (
                      <Shield className="w-5 h-5 text-green-300" />
                    )}
                  </h3>
                  <p className="text-indigo-200">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeBadge.bg} ${typeBadge.text}`}
                    >
                      <TypeIcon className="w-3 h-3" />
                      {typeBadge.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onSendEmail && (
                  <button
                    onClick={() => onSendEmail(user)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Send Email"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(user)}
                    className="px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Edit User
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-600'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                {renderTypeSpecificStats()}

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-900">{user.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Account Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Joined</p>
                          <p className="text-sm font-medium text-gray-900">{user.joinDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Clock className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Active</p>
                          <p className="text-sm font-medium text-gray-900">{user.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Award className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">User ID</p>
                          <p className="text-sm font-medium text-gray-900">{user.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type-specific info */}
                <div className="pt-4 border-t border-gray-200">
                  {renderTypeSpecificInfo()}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Recent Activity</h4>
                <div className="space-y-3">
                  {[
                    { action: 'Logged in', time: '2 hours ago', icon: User },
                    { action: 'Updated profile', time: '1 day ago', icon: Settings },
                    { action: 'Made a purchase', time: '3 days ago', icon: ShoppingBag },
                    { action: 'Account created', time: user.joinDate, icon: CheckCircle },
                  ].map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Transaction History</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="pb-3">Transaction ID</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { id: 'TXN-001', type: 'Payment', amount: '₹2,500', date: 'Nov 15, 2025', status: 'Completed' },
                        { id: 'TXN-002', type: 'Refund', amount: '₹500', date: 'Nov 10, 2025', status: 'Processed' },
                        { id: 'TXN-003', type: 'Payment', amount: '₹1,200', date: 'Nov 5, 2025', status: 'Completed' },
                      ].map((txn, idx) => (
                        <tr key={idx}>
                          <td className="py-3 text-sm font-medium text-gray-900">{txn.id}</td>
                          <td className="py-3 text-sm text-gray-600">{txn.type}</td>
                          <td className="py-3 text-sm font-medium text-gray-900">{txn.amount}</td>
                          <td className="py-3 text-sm text-gray-600">{txn.date}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Account Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Account Status</p>
                      <p className="text-xs text-gray-500">Current account status</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Verification</p>
                      <p className="text-xs text-gray-500">Email verification status</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500">Additional security layer</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      <XCircle className="w-3 h-3" />
                      Disabled
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-3">
              {onSendEmail && (
                <button
                  onClick={() => onSendEmail(user)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
