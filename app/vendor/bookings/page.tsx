"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiX,
  FiMapPin,
  FiPhone,
  FiMessageSquare,
  FiCalendar,
  FiUser,
  FiTool,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

interface Booking {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  bookingDate: string;
  bookingTime: string;
  totalAmount: number;
  servicePrice: number;
  status: string;
  specialRequests?: string;
  createdAt: string;
  service: {
    id: string;
    title: string;
    images: string;
    price: number;
    duration: number;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
}

const statusFilters = ["All", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const statusDisplayNames: Record<string, string> = {
  "PENDING": "Pending",
  "CONFIRMED": "Confirmed",
  "IN_PROGRESS": "In Progress",
  "COMPLETED": "Completed",
  "CANCELLED": "Cancelled",
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "PENDING": "bg-yellow-100 text-yellow-800",
    "CONFIRMED": "bg-blue-100 text-blue-800",
    "IN_PROGRESS": "bg-purple-100 text-purple-800",
    "COMPLETED": "bg-green-100 text-green-800",
    "CANCELLED": "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return <FiClock className="w-4 h-4" />;
    case "CONFIRMED":
      return <FiCheckCircle className="w-4 h-4" />;
    case "IN_PROGRESS":
      return <FiTool className="w-4 h-4" />;
    case "COMPLETED":
      return <FiCheckCircle className="w-4 h-4" />;
    case "CANCELLED":
      return <FiX className="w-4 h-4" />;
    default:
      return null;
  }
};

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format time - just display as stored, add duration if available
const formatTime = (time: string, duration?: number) => {
  if (!time) return 'Time not set';
  
  // Just return the time as-is since it's stored in readable format like "02:00 PM"
  return time;
};

export default function VendorBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Get seller ID from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user found');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      const sellerId = user.id;
      
      console.log('📥 Fetching bookings for seller:', sellerId);
      
      const response = await fetch(`/api/bookings?sellerId=${sellerId}&type=SERVICE`);
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Loaded', data.bookings.length, 'bookings');
        setBookings(data.bookings);
      } else {
        console.error('❌ Failed to load bookings:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdating(bookingId);
      
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        ));
        
        // Update selected booking if open
        if (selectedBooking?.id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
        
        console.log('✅ Status updated to:', newStatus);
      } else {
        console.error('❌ Failed to update status:', data.message);
        alert('Failed to update status: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || booking.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: bookings.filter(b => b.status === "PENDING").length,
    confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
    inProgress: bookings.filter(b => b.status === "IN_PROGRESS").length,
    completed: bookings.filter(b => b.status === "COMPLETED").length,
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Bookings</h1>
          <p className="text-gray-600 mt-1">Manage and track your service bookings</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiClock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiTool className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule Alert */}
      {stats.pending > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">You have {stats.pending} pending booking(s)</p>
                <p className="text-sm text-blue-100">Please confirm or reschedule them</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedStatus("PENDING")}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              View Pending
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking ID, customer name, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "All" ? "All" : statusDisplayNames[status] || status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(booking.customerName || 'Guest')}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {statusDisplayNames[booking.status] || booking.status}
                    </span>
                  </div>
                  <p className="text-blue-600 font-medium">{booking.service?.title || 'Unknown Service'}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {formatDate(booking.bookingDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {formatTime(booking.bookingTime, booking.service?.duration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-gray-900">₹{booking.totalAmount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FiEye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            </div>

            {/* Booking ID */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Booking ID: <span className="font-medium text-gray-700">{booking.orderNumber}</span></span>
              <div className="flex items-center gap-2">
                {booking.customerPhone && (
                  <a 
                    href={`tel:${booking.customerPhone}`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                    title="Call"
                  >
                    <FiPhone className="w-4 h-4" />
                  </a>
                )}
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Message">
                  <FiMessageSquare className="w-4 h-4" />
                </button>
                {booking.customerAddress && (
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Location">
                    <FiMapPin className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {bookings.length === 0 
                ? "You don't have any bookings yet" 
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedBooking.orderNumber}</h2>
                <p className="text-sm text-gray-500">{selectedBooking.service?.title}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                  {getStatusIcon(selectedBooking.status)}
                  {statusDisplayNames[selectedBooking.status] || selectedBooking.status}
                </span>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getInitials(selectedBooking.customerName || 'Guest')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedBooking.customerName}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.customerPhone}</p>
                    </div>
                  </div>
                  {selectedBooking.customerEmail && (
                    <div className="flex items-start gap-2">
                      <FiUser className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-600">{selectedBooking.customerEmail}</p>
                    </div>
                  )}
                  {selectedBooking.customerAddress && (
                    <div className="flex items-start gap-2">
                      <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-600">{selectedBooking.customerAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium text-gray-900">{selectedBooking.service?.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-900">{formatDate(selectedBooking.bookingDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time Slot</span>
                    <span className="font-medium text-gray-900">
                      {formatTime(selectedBooking.bookingTime, selectedBooking.service?.duration)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">{selectedBooking.service?.duration} minutes</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-blue-600">₹{selectedBooking.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedBooking.specialRequests && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedBooking.specialRequests}</p>
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateBookingStatus(selectedBooking.id, status)}
                      disabled={updating === selectedBooking.id || selectedBooking.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        selectedBooking.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {updating === selectedBooking.id ? '...' : statusDisplayNames[status] || status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              {selectedBooking.customerPhone && (
                <a 
                  href={`tel:${selectedBooking.customerPhone}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiPhone className="w-4 h-4" />
                  Call Customer
                </a>
              )}
              <button 
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <FiCheckCircle className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
