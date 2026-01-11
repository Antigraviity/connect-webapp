"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiPackage,
  FiUsers,
  FiCalendar,
  FiStar,
  FiDollarSign,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiPlus,
} from "react-icons/fi";

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-primary-50 text-primary-700";
    case "IN_PROGRESS":
      return "bg-primary-100 text-primary-800";
    case "SCHEDULED":
      return "bg-primary-50 text-primary-600";
    case "PENDING":
      return "bg-primary-50 text-primary-600";
    case "CANCELLED":
      return "bg-red-50 text-red-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

export default function ServicesAdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/services/dashboard');
      const data = await response.json();

      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const serviceStats = [
    {
      label: "Total Services",
      value: loading ? '-' : dashboardData?.stats.totalServices.toLocaleString() || '0',
      icon: FiPackage,
      color: "bg-primary-500",
    },
    {
      label: "Active Vendors",
      value: loading ? '-' : dashboardData?.stats.activeVendors.toLocaleString() || '0',
      icon: FiUsers,
      color: "bg-primary-500",
    },
    {
      label: "Today's Bookings",
      value: loading ? '-' : dashboardData?.stats.todaysBookings.toLocaleString() || '0',
      icon: FiCalendar,
      color: "bg-primary-500",
    },
    {
      label: "Avg Rating",
      value: loading ? '-' : dashboardData?.stats.avgRating || '0.0',
      icon: FiStar,
      color: "bg-primary-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all service-related activities on the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
          </select>
          <Link
            href="/admin/services/categories"
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
          >
            <FiPlus className="w-4 h-4" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-xs font-medium">{stat.label}</h3>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-center gap-2 text-primary-700 mb-2">
            <FiCheckCircle className="w-4 h-4 opacity-70" />
            <span className="text-xs font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold text-primary-900">
            {loading ? '-' : dashboardData?.bookingStats.completed.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-center gap-2 text-primary-700 mb-2">
            <FiClock className="w-4 h-4 opacity-70" />
            <span className="text-xs font-medium">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-primary-900">
            {loading ? '-' : dashboardData?.bookingStats.inProgress.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-primary-600/70">currently</p>
        </div>
        <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-center gap-2 text-primary-700 mb-2">
            <FiCalendar className="w-4 h-4 opacity-70" />
            <span className="text-xs font-medium">Confirmed</span>
          </div>
          <p className="text-2xl font-bold text-primary-900">
            {loading ? '-' : (dashboardData?.bookingStats?.confirmed || 0).toLocaleString()}
          </p>
          <p className="text-xs text-primary-600/70">bookings</p>
        </div>
        <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-center gap-2 text-primary-700 mb-2">
            <FiAlertCircle className="w-4 h-4 opacity-70" />
            <span className="text-xs font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-primary-900">
            {loading ? '-' : dashboardData?.bookingStats.pending.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-primary-600/70">approval</p>
        </div>
        <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-center gap-2 text-primary-700 mb-2">
            <FiAlertCircle className="w-4 h-4 opacity-70" />
            <span className="text-xs font-medium">Cancelled</span>
          </div>
          <p className="text-2xl font-bold text-primary-900">
            {loading ? '-' : dashboardData?.bookingStats.cancelled.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
          <div className="flex items-center gap-2 text-primary-700 mb-2">
            <FiDollarSign className="w-4 h-4 opacity-70" />
            <span className="text-xs font-medium">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-primary-900">
            {loading ? '-' : `₹${(dashboardData?.bookingStats.revenue / 100000).toFixed(1)}L` || '₹0'}
          </p>
        </div>
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Top Performing Vendors</h2>
          <Link
            href="/admin/services/vendors"
            className="text-sm text-primary-600 font-semibold hover:text-primary-800"
          >
            View All Vendors →
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading vendors...</div>
        ) : dashboardData?.topVendors && dashboardData.topVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.topVendors.map((vendor: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-primary-50/50 border border-primary-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div className="flex items-center gap-1 text-primary-500">
                    <FiStar className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{vendor.rating}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{vendor.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{vendor.category}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{vendor.bookings} bookings</span>
                  <span className="font-bold text-primary-700">₹{vendor.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No vendors found</div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
          <Link
            href="/admin/services/bookings"
            className="text-sm text-primary-600 font-semibold hover:text-primary-800"
          >
            View All →
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading bookings...</div>
        ) : dashboardData?.recentBookings && dashboardData.recentBookings.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.recentBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {booking.service}
                    </p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {booking.customer} • {booking.vendor}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">₹{booking.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{booking.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No recent bookings</div>
        )}
      </div>
    </div>
  );
}
