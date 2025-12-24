"use client";

import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiCheckCircle,
  FiAlertTriangle,
  FiSearch,
  FiDownload,
  FiFilter,
  FiEye,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";

interface Booking {
  id: string;
  fullId: string;
  bookingId: string;
  serviceName: string;
  serviceDescription: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  providerName: string;
  scheduleDate: string;
  scheduleTime: string;
  scheduleDuration: string;
  location: string;
  payment: string;
  paymentAmount: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

interface Stats {
  totalBookings: number;
  todayBookings: number;
  completedServices: number;
  revenueToday: number;
  yesterdayBookings: number;
  yesterdayRevenue: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return { bg: "bg-green-100", text: "text-green-800", icon: FiCheckCircle, label: "Completed" };
    case "CONFIRMED":
    case "PROCESSING":
      return { bg: "bg-blue-100", text: "text-blue-800", icon: FiClock, label: "Confirmed" };
    case "PENDING":
      return { bg: "bg-yellow-100", text: "text-yellow-800", icon: FiClock, label: "Pending" };
    case "CANCELLED":
      return { bg: "bg-red-100", text: "text-red-800", icon: FiAlertTriangle, label: "Cancelled" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", icon: FiClock, label: status };
  }
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
    case "SUCCESS":
      return { bg: "bg-green-100", text: "text-green-800", label: "Paid" };
    case "PENDING":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" };
    case "FAILED":
      return { bg: "bg-red-100", text: "text-red-800", label: "Failed" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

export default function ServiceBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    todayBookings: 0,
    completedServices: 0,
    revenueToday: 0,
    yesterdayBookings: 0,
    yesterdayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/services/bookings");
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to fetch bookings");
      }
    } catch (err) {
      setError("Network error: Could not fetch bookings");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate percentage changes
  const todayChange = stats.yesterdayBookings > 0
    ? ((stats.todayBookings - stats.yesterdayBookings) / stats.yesterdayBookings) * 100
    : 0;
  
  const revenueChange = stats.yesterdayRevenue > 0
    ? ((stats.revenueToday - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100
    : 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-800 mb-4">
            <FiAlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Error Loading Bookings</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Service Bookings Management</h1>
              <span className="px-2 py-1 bg-white/20 backdrop-blur text-xs font-semibold rounded-full">
                LIVE DATA
              </span>
            </div>
            <p className="mt-2 opacity-90">
              Monitor and manage all service bookings on the platform
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
            <p className="text-sm text-gray-500">Today's Bookings</p>
            {todayChange !== 0 && (
              <div className="flex items-center gap-1 mt-1">
                {todayChange > 0 ? (
                  <FiTrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <FiTrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${todayChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(todayChange).toFixed(1)}% from yesterday
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.completedServices.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Completed Services</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{stats.revenueToday.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-500">Revenue Today</p>
            {revenueChange !== 0 && (
              <div className="flex items-center gap-1 mt-1">
                {revenueChange > 0 ? (
                  <FiTrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <FiTrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(revenueChange).toFixed(1)}% from yesterday
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FiFilter className="w-4 h-4" />
            More Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {bookings.length === 0 ? "No Bookings Found" : "No bookings match your search"}
          </h3>
          <p className="text-gray-500">
            {searchQuery || filterStatus !== "all"
              ? "Try adjusting your filters"
              : "Bookings will appear here once customers book services"}
          </p>
        </div>
      ) : (
        <>
          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                All Bookings ({filteredBookings.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Booking Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Service Provider
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking) => {
                    const statusBadge = getStatusBadge(booking.status);
                    const paymentBadge = getPaymentStatusBadge(booking.paymentStatus);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr key={booking.fullId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{booking.bookingId}</p>
                            <p className="text-sm text-gray-600">{booking.serviceName}</p>
                            <p className="text-xs text-gray-500">{booking.serviceDescription}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{booking.customerName}</p>
                            <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                            <p className="text-xs text-gray-500">{booking.customerPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {booking.providerName.charAt(0)}
                            </div>
                            <p className="font-medium text-gray-900">{booking.providerName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-900">
                              <FiCalendar className="w-3 h-3" />
                              {booking.scheduleDate}
                            </div>
                            {booking.scheduleTime && (
                              <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <FiClock className="w-3 h-3" />
                                {booking.scheduleTime} ({booking.scheduleDuration})
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-gray-500 mt-1">
                              <FiMapPin className="w-3 h-3" />
                              {booking.location}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-green-600">{booking.payment}</p>
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${paymentBadge.bg} ${paymentBadge.text} mt-1`}
                            >
                              {paymentBadge.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => alert(`View details for ${booking.bookingId}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
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
                Showing {filteredBookings.length} of {bookings.length} bookings (live data)
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
