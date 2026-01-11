"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiShield,
  FiDownload,
  FiUpload,
  FiPackage,
  FiShoppingBag,
  FiBriefcase,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";

// Import modals
import UserDetailsModal from "@/components/admin/modals/UserDetailsModal";
import EditUserModal from "@/components/admin/modals/EditUserModal";
import SendEmailModal from "@/components/admin/modals/SendEmailModal";

// User type definition
type UserType = "BUYER" | "VENDOR" | "SELLER" | "COMPANY" | "EMPLOYER" | "JOB_SEEKER" | "USER";
type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  location: string;
  joinDate: string;
  lastActive: string;
  status: UserStatus;
  avatar: string;
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
  bio?: string;
  skills?: string[];
  companySize?: string;
  industry?: string;
  website?: string;
  verified?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return { bg: "bg-green-100", text: "text-green-700", icon: FiCheckCircle };
    case "SUSPENDED":
      return { bg: "bg-red-100", text: "text-red-800", icon: FiXCircle };
    case "INACTIVE":
      return { bg: "bg-gray-100", text: "text-gray-800", icon: FiClock };
    case "PENDING":
      return { bg: "bg-slate-100", text: "text-slate-800", icon: FiClock };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", icon: FiClock };
  }
};

const getUserTypeBadge = (type: string) => {
  switch (type) {
    case "BUYER":
      return { bg: "bg-primary-100", text: "text-primary-800", label: "Buyer" };
    case "VENDOR":
      return { bg: "bg-primary-50", text: "text-primary-600", label: "Vendor" };
    case "SELLER":
      return { bg: "bg-primary-50", text: "text-primary-700", label: "Seller" };
    case "EMPLOYER":
    case "COMPANY":
      return { bg: "bg-primary-50", text: "text-primary-700", label: "Employer" };
    case "JOB_SEEKER":
      return { bg: "bg-primary-50", text: "text-primary-700", label: "Job Seeker" };
    case "USER":
      return { bg: "bg-gray-100", text: "text-gray-800", label: "User" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: type };
  }
};

export default function UsersPage() {
  // State for users data
  const [usersData, setUsersData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    buyers: 0,
    vendors: 0,
    companies: 0,
    jobSeekers: 0,
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success && data.users) {
        // Transform API data to match our User interface
        const transformedUsers: User[] = data.users.map((user: any) => ({
          id: user.id,
          name: user.name || 'N/A',
          email: user.email,
          phone: 'N/A',
          type: (user.userType || 'BUYER') as UserType,
          location: `${user.city || 'Unknown'}, ${user.state || 'India'}`,
          joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          lastActive: 'Recently',
          status: 'ACTIVE' as UserStatus,
          avatar: user.name ? user.name.substring(0, 2).toUpperCase() : 'U',
          verified: false,
        }));

        setUsersData(transformedUsers);

        // Calculate stats
        const buyers = transformedUsers.filter(u => u.type === 'BUYER').length;
        const vendors = transformedUsers.filter(u => u.type === 'VENDOR' || u.type === 'SELLER').length;
        const companies = transformedUsers.filter(u => u.type === 'COMPANY').length;
        const jobSeekers = transformedUsers.filter(u => u.type === 'JOB_SEEKER').length;

        setStats({
          total: transformedUsers.length,
          buyers,
          vendors,
          companies,
          jobSeekers,
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const userStats = [
    { label: "Total Users", value: loading ? "-" : stats.total.toLocaleString(), icon: FiUsers, color: "bg-primary-600", change: "+8.2%" },
    { label: "Buyers", value: loading ? "-" : stats.buyers.toLocaleString(), icon: FiShoppingBag, color: "bg-primary-500", change: "+12.5%" },
    { label: "Vendors/Sellers", value: loading ? "-" : stats.vendors.toLocaleString(), icon: FiPackage, color: "bg-primary-500", change: "+10.3%" },
    { label: "Companies", value: loading ? "-" : stats.companies.toLocaleString(), icon: FiBriefcase, color: "bg-primary-500", change: "+15.8%" },
    { label: "Job Seekers", value: loading ? "-" : stats.jobSeekers.toLocaleString(), icon: FiUsers, color: "bg-primary-500", change: "+22.1%" },
  ];

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Modal states
  const [viewDetailsModal, setViewDetailsModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [sendEmailModal, setSendEmailModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || user.type === filterType;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handler functions for modals
  const handleViewDetails = (user: User) => {
    setViewDetailsModal({ isOpen: true, user });
    setShowActionMenu(null);
  };

  const handleEditUser = (user: User) => {
    setEditUserModal({ isOpen: true, user });
    setViewDetailsModal({ isOpen: false, user: null });
    setShowActionMenu(null);
  };

  const handleSendEmail = (user: User) => {
    setSendEmailModal({ isOpen: true, user });
    setViewDetailsModal({ isOpen: false, user: null });
    setShowActionMenu(null);
  };

  const handleSaveUser = (updatedUser: User) => {
    setUsersData((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    showToast(`User "${updatedUser.name}" updated successfully!`, 'success');
  };

  const handleEmailSent = (emailData: any) => {
    showToast(`Email sent to ${emailData.toName} successfully!`, 'success');
  };

  const handleSuspendUser = (userId: string) => {
    setUsersData((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: "SUSPENDED" as UserStatus } : u
      )
    );
    showToast("User suspended successfully!", 'success');
    setShowActionMenu(null);
  };

  const handleActivateUser = (userId: string) => {
    setUsersData((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: "ACTIVE" as UserStatus } : u
      )
    );
    showToast("User activated successfully!", 'success');
    setShowActionMenu(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setUsersData((prev) => prev.filter((u) => u.id !== userId));
      showToast("User deleted successfully!", 'success');
    }
    setShowActionMenu(null);
  };

  // Close action menu when clicking outside
  const handleClickOutside = () => {
    if (showActionMenu) {
      setShowActionMenu(null);
    }
  };

  return (
    <div className="p-6 space-y-6" onClick={handleClickOutside}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
          {toast.type === 'success' ? (
            <FiCheckCircle className="w-5 h-5" />
          ) : (
            <FiXCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">LIVE DATA</span>
          </div>
          <p className="text-gray-600 mt-1">
            Manage all users across the platform - buyers, vendors, sellers, and companies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold">
            <FiPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {userStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`${stat.color} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-primary-600 font-medium">{stat.change} this month</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
              <option value="BUYER">Buyers</option>
              <option value="VENDOR">Vendors</option>
              <option value="SELLER">Sellers</option>
              <option value="EMPLOYER">Employers</option>
              <option value="COMPANY">Companies</option>
              <option value="JOB_SEEKER">Job Seekers</option>
              <option value="USER">Users</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-700">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
              Activate
            </button>
            <button className="px-3 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors shadow-sm">
              Suspend
            </button>
            <button className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const statusBadge = getStatusBadge(user.status);
                const typeBadge = getUserTypeBadge(user.type);
                const StatusIcon = statusBadge.icon;

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
                        {typeBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FiMapPin className="w-3.5 h-3.5 text-gray-400" />
                        {user.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">Joined {user.joinDate}</p>
                        <p className="text-xs text-gray-500">Active {user.lastActive}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiMoreVertical className="w-4 h-4" />
                        </button>
                        {showActionMenu === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => handleViewDetails(user)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <FiEye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <FiEdit2 className="w-4 h-4" />
                              Edit User
                            </button>
                            <button
                              onClick={() => handleSendEmail(user)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <FiMail className="w-4 h-4" />
                              Send Email
                            </button>
                            <hr className="my-1" />
                            {user.status === "ACTIVE" ? (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                              >
                                <FiXCircle className="w-4 h-4" />
                                Suspend User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(user.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                              >
                                <FiCheckCircle className="w-4 h-4" />
                                Activate User
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {usersData.length} users
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">2</button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">3</button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserDetailsModal
        isOpen={viewDetailsModal.isOpen}
        onClose={() => setViewDetailsModal({ isOpen: false, user: null })}
        user={viewDetailsModal.user}
        onEdit={handleEditUser}
        onSendEmail={handleSendEmail}
      />

      <EditUserModal
        isOpen={editUserModal.isOpen}
        onClose={() => setEditUserModal({ isOpen: false, user: null })}
        user={editUserModal.user}
        onSave={handleSaveUser}
      />

      <SendEmailModal
        isOpen={sendEmailModal.isOpen}
        onClose={() => setSendEmailModal({ isOpen: false, user: null })}
        user={sendEmailModal.user}
        onSend={handleEmailSent}
      />
    </div>
  );
}
