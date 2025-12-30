"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiClock,
  FiMapPin,
  FiPhone,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiRefreshCw,
  FiStar,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiBox,
  FiFileText,
  FiLoader,
} from "react-icons/fi";

interface Order {
  id: string;
  orderNumber: string;
  serviceId: string;
  buyerId: string;
  sellerId: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  servicePrice: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  specialRequests: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  service: {
    id: string;
    title: string;
    slug: string;
    images: string;
    price: number;
  } | null;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "REFUNDED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "CONFIRMED":
      return "Confirmed";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "REFUNDED":
      return "Refunded";
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return FiClock;
    case "CONFIRMED":
      return FiCheckCircle;
    case "IN_PROGRESS":
      return FiTruck;
    case "COMPLETED":
      return FiCheck;
    case "CANCELLED":
      return FiX;
    case "REFUNDED":
      return FiRefreshCw;
    default:
      return FiPackage;
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "PAID":
      return "text-green-600";
    case "PENDING":
      return "text-orange-600";
    case "FAILED":
      return "text-red-600";
    case "REFUNDED":
      return "text-gray-600";
    default:
      return "text-gray-600";
  }
};

// Parse images from JSON string
const parseImages = (imagesStr: string | undefined): string[] => {
  if (!imagesStr) return [];
  try {
    return JSON.parse(imagesStr) || [];
  } catch {
    return [];
  }
};

export default function BuyerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch orders on mount
  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch only PRODUCT type orders (not SERVICE bookings)
      const response = await fetch(`/api/orders?buyerId=${user.id}&type=PRODUCT&limit=50`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('An error occurred while loading orders');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getActiveOrders = () => orders.filter((o) => !["COMPLETED", "CANCELLED", "REFUNDED"].includes(o.status)).length;
  const getCompletedOrders = () => orders.filter((o) => o.status === "COMPLETED").length;
  const getCancelledOrders = () => orders.filter((o) => o.status === "CANCELLED").length;

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // If not logged in
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">Sign in to view your orders</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 hover:from-primary-400 hover:to-primary-600 text-white font-semibold rounded-xl shadow-sm transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="text-xl font-bold text-gray-900">{getActiveOrders()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900">{getCompletedOrders()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-xl font-bold text-gray-900">{getCancelledOrders()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or service name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiLoader className="w-12 h-12 text-[#0053B0] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 hover:from-primary-400 hover:to-primary-600 text-white font-semibold rounded-xl shadow-sm transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your filters or search query"
                  : "You haven't placed any orders yet"}
              </p>
              <Link
                href="/buyer/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 hover:from-primary-400 hover:to-primary-600 text-white font-semibold rounded-xl shadow-sm transition-all"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrders.includes(order.id);
              const StatusIcon = getStatusIcon(order.status);
              const images = parseImages(order.service?.images);
              const serviceImage = images[0] || 'https://via.placeholder.com/100x100?text=Service';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrderExpand(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${order.status === "COMPLETED" ? "bg-green-100" :
                          order.status === "CANCELLED" ? "bg-red-100" :
                            "bg-blue-100"
                          }`}>
                          <StatusIcon className={`w-6 h-6 ${order.status === "COMPLETED" ? "text-green-600" :
                            order.status === "CANCELLED" ? "text-red-600" :
                              "text-blue-600"
                            }`} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            Ordered on {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        {isExpanded ? (
                          <FiChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Quick Preview */}
                    <div className="flex items-center gap-3 mt-3">
                      <img
                        src={serviceImage}
                        alt={order.service?.title || 'Service'}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Service';
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.service?.title || 'Service'}</p>
                        <p className="text-xs text-gray-500">by {order.seller?.name || 'Seller'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {/* Order Details */}
                      <div className="p-4 bg-gray-50">
                        <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex items-start gap-4">
                            <img
                              src={serviceImage}
                              alt={order.service?.title || 'Service'}
                              className="w-20 h-20 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Service';
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{order.service?.title || 'Service'}</p>
                              <p className="text-sm text-gray-600">Provider: {order.seller?.name}</p>
                              <p className="text-sm text-gray-600">Duration: {order.duration} mins</p>
                              <div className="flex items-center gap-2 mt-2">
                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {formatDate(order.bookingDate)} at {order.bookingTime}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#0053B0]">₹{order.servicePrice}</p>
                            </div>
                          </div>

                          {/* Special Requests */}
                          {order.specialRequests && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700">Special Requests:</p>
                              <p className="text-sm text-gray-600 mt-1">{order.specialRequests}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Customer & Payment Info */}
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Customer Info */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <FiMapPin className="w-4 h-4" />
                              Customer Details
                            </h4>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="font-medium text-gray-900">{order.customerName}</p>
                              <p className="text-sm text-gray-600">{order.customerEmail}</p>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <FiPhone className="w-3 h-3" />
                                {order.customerPhone}
                              </p>
                              {order.customerAddress && (
                                <p className="text-sm text-gray-600 mt-1">{order.customerAddress}</p>
                              )}
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
                            <div className="bg-white p-3 rounded-lg">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Method</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {order.paymentMethod?.replace(/_/g, ' ') || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Status</span>
                                <span className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                              {order.discount > 0 && (
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Discount</span>
                                  <span className="text-sm font-medium text-green-600">-₹{order.discount}</span>
                                </div>
                              )}
                              {order.taxAmount > 0 && (
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-600">Tax</span>
                                  <span className="text-sm font-medium text-gray-900">₹{order.taxAmount}</span>
                                </div>
                              )}
                              <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                                <span className="font-medium text-gray-900">Total</span>
                                <span className="font-bold text-green-600">₹{order.totalAmount}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-4">
                          {order.status === "COMPLETED" && (
                            <>
                              <Link
                                href={`/buyer/reviews?orderId=${order.id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 hover:from-primary-400 hover:to-primary-600 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
                              >
                                <FiStar className="w-4 h-4" />
                                Rate & Review
                              </Link>
                            </>
                          )}
                          {!["COMPLETED", "CANCELLED", "REFUNDED"].includes(order.status) && (
                            <>
                              <Link
                                href={`/buyer/messages?sellerId=${order.sellerId}`}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 hover:from-primary-400 hover:to-primary-600 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
                              >
                                <FiPhone className="w-4 h-4" />
                                Contact Seller
                              </Link>
                            </>
                          )}
                          <Link
                            href={`/buyer/orders/${order.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
                          >
                            <FiFileText className="w-4 h-4" />
                            View Details
                          </Link>
                          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm">
                            <FiMessageSquare className="w-4 h-4" />
                            Need Help?
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
