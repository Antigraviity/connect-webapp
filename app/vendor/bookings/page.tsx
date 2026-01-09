"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import LoadingSpinner from "@/components/common/LoadingSpinner";

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
    "CONFIRMED": "bg-emerald-100 text-emerald-800",
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
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [showSuccessStatusModal, setShowSuccessStatusModal] = useState(false);
  const router = useRouter();

  const handleMessage = (buyerId?: string) => {
    if (!buyerId) {
      alert("Customer ID not found");
      return;
    }
    router.push(`/vendor/messages/services?conversationWith=${buyerId}`);
  };

  const handleLocation = (address?: string) => {
    if (!address) {
      alert("Address not found");
      return;
    }
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

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
    // We already updated state optimistically in confirmStatusChange
    // This now just handles the API call and error recovery
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error('❌ Failed to update status:', data.message);
        throw new Error(data.message);
      }

      console.log('✅ Status updated on server to:', newStatus);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      // Optional: Revert state logic could go here if we kept previous state
      alert('Failed to update status on server. Please refresh the page.');
    } finally {
      setUpdating(null);
      setUpdatingStatus(null);
    }
  };

  const initiateStatusChange = (status: string) => {
    setPendingStatus(status);
    setShowStatusConfirm(true);
  };

  const confirmStatusChange = async () => {
    if (selectedBooking && pendingStatus) {
      const bookingId = selectedBooking.id;
      const newStatus = pendingStatus;

      // 1. Update UI Optimistically
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
      if (selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
      }

      // 2. Clear pending state and close modal immediately
      setShowStatusConfirm(false);
      setPendingStatus(null);

      // 3. Show success notification immediately
      setShowSuccessStatusModal(true);

      // 4. Perform API call in background
      updateBookingStatus(bookingId, newStatus);
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

  const [buyerPreferences, setBuyerPreferences] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [updatingSchedule, setUpdatingSchedule] = useState(false);

  // Fetch buyer preferences when a booking is selected
  useEffect(() => {
    const fetchPreferences = async () => {
      if (selectedBooking?.buyer?.id) {
        try {
          const response = await fetch(`/api/users/preferences?userId=${selectedBooking.buyer.id}`);
          const data = await response.json();
          if (data.success && data.preferences) {
            setBuyerPreferences(data.preferences);
          } else {
            setBuyerPreferences(null);
          }
        } catch (error) {
          console.error("Error fetching preferences:", error);
          setBuyerPreferences(null);
        }
      } else {
        setBuyerPreferences(null);
      }
    };

    fetchPreferences();
  }, [selectedBooking]);

  const handleUpdateSchedule = async () => {
    if (!selectedBooking || !scheduledDate || !scheduledTime) return;

    setUpdatingSchedule(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedBooking.id,
          status: selectedBooking.status,
          bookingDate: scheduledDate,
          bookingTime: scheduledTime,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state - ensure bookingDate is a string as per interface
        const updatedDateStr = new Date(scheduledDate).toISOString();
        setBookings(prev => prev.map(b =>
          b.id === selectedBooking.id
            ? { ...b, bookingDate: updatedDateStr, bookingTime: scheduledTime }
            : b
        ));
        setSelectedBooking({
          ...selectedBooking,
          bookingDate: updatedDateStr,
          bookingTime: scheduledTime
        });
        alert('Delivery schedule updated successfully!');
      } else {
        alert('Failed to update schedule: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
    } finally {
      setUpdatingSchedule(false);
    }
  };

  useEffect(() => {
    if (selectedBooking) {
      // Pre-fill with existing values if they exist
      const date = selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toISOString().split('T')[0] : "";
      setScheduledDate(date);
      setScheduledTime(selectedBooking.bookingTime || "");
    }
  }, [selectedBooking]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage all your service appointments</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <FiClock className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-600">Confirmed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <FiTool className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-600">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 font-sans">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <FiFilter className="text-gray-400 min-w-[20px]" />
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedStatus === status
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {statusDisplayNames[status] || status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Side: Status & Basic Info */}
                  <div className="md:w-64 flex-shrink-0 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{booking.orderNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {statusDisplayNames[booking.status] || booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 flex-shrink-0">
                        {booking.service.title.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1" title={booking.service.title}>
                          {booking.service.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                          <FiClock className="w-3.5 h-3.5" />
                          <span>{booking.service.duration} mins</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-emerald-600">₹{booking.totalAmount}</p>
                    </div>
                  </div>

                  {/* Right Side: Details & Actions */}
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiClock className="w-4 h-4 text-gray-400" />
                          <span>{formatTime(booking.bookingTime, booking.service?.duration)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate" title={booking.customerAddress}>
                            {booking.customerAddress || 'No address provided'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                          <FiUser className="w-4 h-4 text-gray-400" />
                          <span>{booking.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <span>{booking.customerPhone}</span>
                        </div>
                        {booking.customerEmail && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiMessageSquare className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{booking.customerEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                      {booking.customerAddress && (
                        <button
                          onClick={() => handleLocation(booking.customerAddress)}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <FiMapPin className="w-4 h-4" />
                          Map
                        </button>
                      )}
                      <button
                        onClick={() => handleMessage(booking.buyer?.id)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FiMessageSquare className="w-4 h-4" />
                        Message
                      </button>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2"
                      >
                        <FiEye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedBooking.orderNumber}</h2>
                <p className="text-sm text-emerald-100">{selectedBooking.service?.title}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
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
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-inner">
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

              {/* Delivery Instructions from Profile */}
              {buyerPreferences?.deliveryInstructions && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiMapPin className="text-emerald-600" />
                    Delivery Instructions (From Profile)
                  </h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-800">{buyerPreferences.deliveryInstructions}</p>
                  </div>
                </div>
              )}

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
                    <span className="text-xl font-bold text-emerald-600">₹{selectedBooking.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Assign Delivery Schedule Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiClock className="text-emerald-600" />
                  Assign Delivery Schedule
                </h3>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-emerald-800 mb-1.5 uppercase tracking-wider">Delivery Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-800 mb-1.5 uppercase tracking-wider">Delivery Time</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUpdateSchedule}
                    disabled={updatingSchedule || !scheduledDate || !scheduledTime}
                    className="w-full mt-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {updatingSchedule ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FiCheckCircle className="w-4 h-4" />
                    )}
                    {updatingSchedule ? 'Updating...' : 'Confirm Delivery Schedule'}
                  </button>
                  <p className="text-[10px] text-emerald-600 mt-2 text-center italic">
                    Once confirmed, this schedule will be visible to the buyer.
                  </p>
                </div>
              </div>

              {/* Customer Notes (Special Requests) */}
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
                      onClick={() => initiateStatusChange(status)}
                      disabled={updating === selectedBooking.id || selectedBooking.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${selectedBooking.status === status
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {updating === selectedBooking.id && updatingStatus === status ? '...' : statusDisplayNames[status] || status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              {selectedBooking.customerPhone && (
                <a
                  href={`tel:${selectedBooking.customerPhone}`}
                  className="px-4 py-2 border border-blue-100 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-2 transition-colors"
                >
                  <FiPhone className="w-4 h-4" />
                  Call
                </a>
              )}
              <button
                onClick={() => {
                  handleMessage(selectedBooking.buyer?.id);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 border border-emerald-100 bg-emerald-50 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100 flex items-center gap-2 transition-colors"
              >
                <FiMessageSquare className="w-4 h-4" />
                Message
              </button>
              {selectedBooking.customerAddress && (
                <button
                  onClick={() => handleLocation(selectedBooking.customerAddress)}
                  className="px-4 py-2 border border-purple-100 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 flex items-center gap-2 transition-colors"
                >
                  <FiMapPin className="w-4 h-4" />
                  Location
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <FiCheckCircle className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowStatusConfirm(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Change Status?</h3>
              <p className="text-gray-600 mb-6 font-sans">
                Are you sure you want to change the status to <span className="font-semibold text-emerald-600">{statusDisplayNames[pendingStatus!] || pendingStatus}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessStatusModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSuccessStatusModal(false)}></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6 font-sans">Booking status has been updated successfully.</p>
              <button
                onClick={() => setShowSuccessStatusModal(false)}
                className="w-full px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
