"use client";

import { useState } from "react";
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
} from "react-icons/fi";

// Mock bookings data
const bookingsData = [
  {
    id: "BK-2024-001234",
    customer: { name: "Rahul Sharma", phone: "+91 98765 43210", address: "123 Main Street, Sector 15, New Delhi - 110001", avatar: "RS" },
    service: "AC Repair & Service",
    date: "Nov 24, 2024",
    time: "10:00 AM - 12:00 PM",
    amount: 499,
    status: "Pending",
    notes: "Split AC not cooling properly. Please bring gas refill kit.",
  },
  {
    id: "BK-2024-001235",
    customer: { name: "Priya Patel", phone: "+91 87654 32109", address: "456 Park Avenue, Andheri West, Mumbai - 400053", avatar: "PP" },
    service: "Plumbing Services",
    date: "Nov 24, 2024",
    time: "2:00 PM - 4:00 PM",
    amount: 349,
    status: "Confirmed",
    notes: "Kitchen sink leakage. Need urgent repair.",
  },
  {
    id: "BK-2024-001236",
    customer: { name: "Amit Kumar", phone: "+91 76543 21098", address: "789 Lake Road, Koramangala, Bangalore - 560034", avatar: "AK" },
    service: "Electrical Repair",
    date: "Nov 23, 2024",
    time: "11:00 AM - 1:00 PM",
    amount: 299,
    status: "In Progress",
    notes: "Multiple switches not working in bedroom.",
  },
  {
    id: "BK-2024-001237",
    customer: { name: "Sneha Reddy", phone: "+91 65432 10987", address: "321 Hill View, T Nagar, Chennai - 600017", avatar: "SR" },
    service: "House Painting",
    date: "Nov 22, 2024",
    time: "9:00 AM - 6:00 PM",
    amount: 2499,
    status: "Completed",
    notes: "2 bedroom painting. Color: Asian Paints Royale - White.",
  },
  {
    id: "BK-2024-001238",
    customer: { name: "Vikram Singh", phone: "+91 54321 09876", address: "555 Garden City, Jubilee Hills, Hyderabad - 500033", avatar: "VS" },
    service: "AC Repair & Service",
    date: "Nov 21, 2024",
    time: "3:00 PM - 5:00 PM",
    amount: 499,
    status: "Cancelled",
    notes: "Window AC making noise.",
  },
];

const statusFilters = ["All", "Pending", "Confirmed", "In Progress", "Completed", "Cancelled"];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "Confirmed": "bg-blue-100 text-blue-800",
    "In Progress": "bg-purple-100 text-purple-800",
    "Completed": "bg-green-100 text-green-800",
    "Cancelled": "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Pending":
      return <FiClock className="w-4 h-4" />;
    case "Confirmed":
      return <FiCheckCircle className="w-4 h-4" />;
    case "In Progress":
      return <FiTool className="w-4 h-4" />;
    case "Completed":
      return <FiCheckCircle className="w-4 h-4" />;
    case "Cancelled":
      return <FiX className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function VendorBookings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState<typeof bookingsData[0] | null>(null);

  const filteredBookings = bookingsData.filter((booking) => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || booking.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: bookingsData.filter(b => b.status === "Pending").length,
    confirmed: bookingsData.filter(b => b.status === "Confirmed").length,
    inProgress: bookingsData.filter(b => b.status === "In Progress").length,
    completed: bookingsData.filter(b => b.status === "Completed").length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Bookings</h1>
        <p className="text-gray-600 mt-1">Manage and track your service bookings</p>
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
              onClick={() => setSelectedStatus("Pending")}
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
                {status}
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
                  {booking.customer.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{booking.customer.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-blue-600 font-medium">{booking.service}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {booking.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-gray-900">₹{booking.amount}</p>
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
              <span className="text-sm text-gray-500">Booking ID: <span className="font-medium text-gray-700">{booking.id}</span></span>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Call">
                  <FiPhone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Message">
                  <FiMessageSquare className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Location">
                  <FiMapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedBooking.id}</h2>
                <p className="text-sm text-gray-500">{selectedBooking.service}</p>
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
                  {selectedBooking.status}
                </span>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedBooking.customer.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedBooking.customer.name}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{selectedBooking.customer.address}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium text-gray-900">{selectedBooking.service}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-900">{selectedBooking.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time Slot</span>
                    <span className="font-medium text-gray-900">{selectedBooking.time}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-blue-600">₹{selectedBooking.amount}</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedBooking.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["Confirmed", "In Progress", "Completed", "Cancelled"].map((status) => (
                    <button
                      key={status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedBooking.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4" />
                Message Customer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
