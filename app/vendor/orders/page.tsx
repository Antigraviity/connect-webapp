"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiEye,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiX,
  FiMapPin,
  FiPhone,
  FiPrinter,
  FiRefreshCw,
  FiAlertCircle,
  FiShoppingBag,
  FiMessageSquare,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    avatar: string;
    image?: string;
    id?: string;
  };
  items: OrderItem[];
  total: number;
  date: string;
  time: string;
  bookingDate?: string;
  bookingTime?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  specialRequests?: string;
  serviceType: string;
}

interface Stats {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

const statusFilters = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "Processing": "bg-emerald-100 text-emerald-800",
    "Shipped": "bg-purple-100 text-purple-800",
    "Delivered": "bg-green-100 text-green-800",
    "Cancelled": "bg-red-100 text-red-800",
    "Refunded": "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getPaymentColor = (status: string) => {
  const colors: Record<string, string> = {
    "Paid": "text-green-600",
    "Pending": "text-yellow-600",
    "Failed": "text-red-600",
    "Refunded": "text-gray-600",
  };
  return colors[status] || "text-gray-600";
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const router = useRouter();

  const handleMessage = (customerId?: string) => {
    if (!customerId) {
      alert("Customer ID not found");
      return;
    }
    // Product orders use standard product messages
    router.push(`/vendor/messages/products?conversationWith=${customerId}`);
  };

  const handleLocation = (address?: string) => {
    if (!address) {
      alert("Address not found");
      return;
    }
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const [buyerPreferences, setBuyerPreferences] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Fetch buyer preferences when an order is selected
  useEffect(() => {
    const fetchPreferences = async () => {
      if (selectedOrder?.customer?.id) {
        try {
          const response = await fetch(`/api/users/preferences?userId=${selectedOrder.customer.id}`);
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
  }, [selectedOrder]);

  // Set up polling for real-time updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(false); // Background refresh without loading state
    }, 10000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('Please login to view orders');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);

      // Build query params
      const params = new URLSearchParams({
        sellerId: user.id,
        ...(statusFilter !== 'All' && { status: statusFilter }),
      });

      const response = await fetch(`/api/vendor/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
        setStats(data.stats || {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        });
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);

      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch('/api/vendor/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          sellerId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh orders
        fetchOrders();
        setSelectedOrder(null);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);
    return matchesSearch;
  });

  // Order Detail Modal
  const OrderDetailModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedOrder(null)} />

          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 overflow-hidden text-left">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Order Details</h3>
                  <p className="text-sm text-emerald-50">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status & Date */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <span className="text-sm text-gray-500">
                  {selectedOrder.date} at {selectedOrder.time}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 text-left">
                <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">{selectedOrder.customer.name}</p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    {selectedOrder.customer.phone || 'N/A'}
                  </p>
                  {selectedOrder.customer.address && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4" />
                      {selectedOrder.customer.address}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  {selectedOrder.customer.phone && (
                    <a
                      href={`tel:${selectedOrder.customer.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      <FiPhone className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleMessage(selectedOrder.customer.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors text-sm"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  {selectedOrder.customer.address && (
                    <button
                      onClick={() => handleLocation(selectedOrder.customer.address)}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-700 py-1.5 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                    >
                      <FiMapPin className="w-4 h-4" />
                      <span>Location</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery Instructions from Profile */}
              {buyerPreferences?.deliveryInstructions && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FiMapPin className="text-blue-700" />
                    Delivery Instructions (From Profile)
                  </h4>
                  <p className="text-sm text-blue-800">{buyerPreferences.deliveryInstructions}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FiPackage className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600">Payment</p>
                  <p className={`font-semibold ${getPaymentColor(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus} • {selectedOrder.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₹{selectedOrder.total}</p>
                </div>
              </div>

              {/* Special Requests */}
              {selectedOrder.specialRequests && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Special Requests</h4>
                  <p className="text-yellow-700">{selectedOrder.specialRequests}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-end">
                {selectedOrder.status === 'Pending' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.orderId, 'Processing')}
                    disabled={updatingStatus === selectedOrder.orderId}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 shadow-sm transition-all"
                  >
                    {updatingStatus === selectedOrder.orderId ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <FiPackage className="w-4 h-4" />
                    )}
                    Accept & Process
                  </button>
                )}
                {selectedOrder.status === 'Processing' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.orderId, 'Shipped')}
                    disabled={updatingStatus === selectedOrder.orderId}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 shadow-sm transition-all"
                  >
                    {updatingStatus === selectedOrder.orderId ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <FiTruck className="w-4 h-4" />
                    )}
                    Mark as Shipped
                  </button>
                )}
                {selectedOrder.status === 'Shipped' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.orderId, 'Delivered')}
                    disabled={updatingStatus === selectedOrder.orderId}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 shadow-sm transition-all"
                  >
                    {updatingStatus === selectedOrder.orderId ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <FiCheckCircle className="w-4 h-4" />
                    )}
                    Mark as Delivered
                  </button>
                )}
                {(selectedOrder.status === 'Pending' || selectedOrder.status === 'Processing') && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this order?')) {
                        handleStatusUpdate(selectedOrder.orderId, 'Cancelled');
                      }
                    }}
                    disabled={updatingStatus === selectedOrder.orderId}
                    className="flex items-center justify-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" color="vendor" label="Loading..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Product Orders</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and track orders for your products</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-emerald-100">
            Products Only
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pending", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50/50", icon: FiClock, iconBg: "bg-amber-100", iconColor: "text-amber-700" },
          { label: "Processing", value: stats.processing, color: "text-emerald-600", bg: "bg-emerald-50/50", icon: FiPackage, iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
          { label: "Shipped", value: stats.shipped, color: "text-purple-600", bg: "bg-purple-50/50", icon: FiTruck, iconBg: "bg-purple-100", iconColor: "text-purple-700" },
          { label: "Delivered", value: stats.delivered, color: "text-green-600", bg: "bg-green-50/50", icon: FiCheckCircle, iconBg: "bg-green-100", iconColor: "text-green-700" }
        ].map((item, index) => (
          <div key={index} className={`${item.bg} rounded-2xl border border-gray-100 p-4 transition-all hover:border-emerald-100 shadow-sm`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider truncate">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all text-sm font-medium"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchOrders()}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all text-sm font-bold border border-transparent hover:border-emerald-100"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="current" />
              ) : (
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              )}
              Refresh
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <div className="flex items-center gap-3 px-1">
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 ${statusFilter === filter
                    ? "bg-emerald-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 sm:p-20 text-center shadow-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Product Orders Found</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm sm:text-base">
            {orders.length === 0
              ? "You don't have any product orders yet. This page shows orders for PRODUCTS only."
              : "No orders match your search criteria."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
            }}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mobile/Tablets List View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-gray-400">#{order.id}</span>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                    {order.customer.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{order.customer.name}</p>
                    <p className="text-xs text-gray-500 truncate">{order.items.length} item(s) • ₹{order.total}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400">{order.date}</p>
                  <p className={`text-[10px] font-bold ${getPaymentColor(order.paymentStatus)}`}>{order.paymentStatus}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Large Screen Table View */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 text-left">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gray-400">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                            {order.customer.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{order.customer.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{order.customer.phone || order.customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.items.length} item(s)</td>
                      <td className="px-6 py-4 text-sm font-black text-emerald-600">₹{order.total}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{order.date}</p>
                        <p className="text-[10px] text-gray-400">{order.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                            disabled={updatingStatus === order.orderId}
                            className={`pl-3 pr-8 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)} border border-gray-200 cursor-pointer focus:border-emerald-500 focus:ring-0 outline-none appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem] shadow-sm`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            }}
                          >
                            {statusFilters.map((s) => s !== "All" && (
                              <option key={s} value={s} className="bg-white text-gray-900">{s}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMessage(order.customer.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Message Customer"
                          >
                            <FiMessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Showing count */}
      {filteredOrders.length > 0 && (
        <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest py-8">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal />
    </div>
  );
}
