"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiLoader,
  FiStar,
  FiMessageSquare,
} from "react-icons/fi";

interface Booking {
  id: string;
  orderNumber: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  servicePrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  specialRequests?: string;
  createdAt: string;
  service: {
    id: string;
    title: string;
    images: string;
    price: number;
    duration: number;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-600", icon: FiAlertCircle, bg: "bg-yellow-100" },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600", icon: FiCheckCircle, bg: "bg-blue-100" },
  IN_PROGRESS: { label: "In Progress", color: "text-purple-600", icon: FiLoader, bg: "bg-purple-100" },
  COMPLETED: { label: "Completed", color: "text-green-600", icon: FiCheckCircle, bg: "bg-green-100" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", icon: FiXCircle, bg: "bg-red-100" },
  REFUNDED: { label: "Refunded", color: "text-gray-600", icon: FiRefreshCw, bg: "bg-gray-100" },
};

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, you would get the buyer ID from the session
      // For now, we'll fetch all bookings and filter by email from localStorage
      const response = await fetch('/api/bookings');
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError('An error occurred while loading bookings');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.seller.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get service image
  const getServiceImage = (images: string) => {
    try {
      const parsed = typeof images === 'string' ? JSON.parse(images) : images;
      if (parsed && parsed.length > 0) {
        return parsed[0];
      }
    } catch (e) {
      // Fallback
    }
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">
                View and manage your service bookings
              </p>
            </div>
            <Link
              href="/book-services"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Book New Service
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by booking ID, service, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchBookings}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-2 text-red-600 font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <>
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCalendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "No bookings match your search criteria"
                    : "You haven't made any bookings yet"}
                </p>
                <Link
                  href="/book-services"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Browse Services
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const status = statusConfig[booking.status] || statusConfig.PENDING;
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Service Image */}
                          <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={getServiceImage(booking.service.images)}
                              alt={booking.service.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500';
                              }}
                            />
                          </div>

                          {/* Booking Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                  {booking.service.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  by {booking.seller.name}
                                </p>
                              </div>
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {status.label}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                <span>{formatDate(booking.bookingDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <FiClock className="w-4 h-4 text-gray-400" />
                                <span>{booking.bookingTime}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <FiMapPin className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{booking.customerAddress?.split(',')[0] || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-bold text-primary-600">₹{booking.totalAmount}</span>
                              </div>
                            </div>

                            {/* Order Number */}
                            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="text-sm">
                                <span className="text-gray-500">Booking ID: </span>
                                <span className="font-mono font-semibold text-gray-900">{booking.orderNumber}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedBooking(booking)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                  View Details
                                  <FiChevronRight className="w-4 h-4" />
                                </button>
                                {booking.status === 'COMPLETED' && (
                                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                                    <FiStar className="w-4 h-4" />
                                    Rate
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedBooking(null)}
          ></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-primary-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Booking Details</h2>
                    <p className="text-primary-100 text-sm mt-1">
                      {selectedBooking.orderNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <FiXCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Status */}
                <div className="mb-6">
                  {(() => {
                    const status = statusConfig[selectedBooking.status] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-semibold">{status.label}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Service Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getServiceImage(selectedBooking.service.images)}
                        alt={selectedBooking.service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{selectedBooking.service.title}</h4>
                      <p className="text-sm text-gray-600">by {selectedBooking.seller.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Duration: {selectedBooking.service.duration} mins
                      </p>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <FiCalendar className="w-5 h-5" />
                      <span className="font-semibold">Date</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedBooking.bookingDate)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <FiClock className="w-5 h-5" />
                      <span className="font-semibold">Time</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {selectedBooking.bookingTime}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5 text-gray-400" />
                    Service Address
                  </h3>
                  <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                    {selectedBooking.customerAddress}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUser className="w-4 h-4" />
                      <span>{selectedBooking.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiPhone className="w-4 h-4" />
                      <span>{selectedBooking.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMail className="w-4 h-4" />
                      <span className="truncate">{selectedBooking.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
                    <p className="text-gray-700 bg-yellow-50 rounded-xl p-4">
                      {selectedBooking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Service Price</span>
                      <span>₹{selectedBooking.servicePrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax & Fees</span>
                      <span>₹{selectedBooking.totalAmount - selectedBooking.servicePrice}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-primary-600 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>₹{selectedBooking.totalAmount}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={`font-semibold ${
                        selectedBooking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {selectedBooking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Provider Contact */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Service Provider</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedBooking.seller.name}</p>
                      <p className="text-sm text-gray-600">{selectedBooking.seller.email}</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                      <FiMessageSquare className="w-4 h-4" />
                      Contact
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                {selectedBooking.status === 'PENDING' && (
                  <button className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-colors">
                    Cancel Booking
                  </button>
                )}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
