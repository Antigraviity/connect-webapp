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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  const [buyerPreferences, setBuyerPreferences] = useState<any>(null);

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

  return (
    <div className="p-6">
      {/* ... previous content ... */}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* ... Modal Header ... */}
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
              {/* Status Badge ... */}
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

              {/* Booking Details ... */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {/* ... existing fields ... */}
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

              {/* Customer Notes (Special Requests) */}
              {selectedBooking.specialRequests && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedBooking.specialRequests}</p>
                  </div>
                </div>
              )}

              {/* Update Status ... */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateBookingStatus(selectedBooking.id, status)}
                      disabled={updating === selectedBooking.id || selectedBooking.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${selectedBooking.status === status
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg"
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
              {/* ... buttons ... */}
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
    </div>
  );
}
