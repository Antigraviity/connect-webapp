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

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FiPhone className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleMessage(selectedOrder.customer.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  {selectedOrder.customer.address && (
                    <button
                      onClick={() => handleLocation(selectedOrder.customer.address)}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-700 py-2 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <FiMapPin className="w-4 h-4" />
                      <span>Location</span>
                    </button>
                  )}
                </div>
              </div>

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
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 shadow-sm transition-all"
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
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 shadow-sm transition-all"
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
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 shadow-sm transition-all"
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
                    className="flex items-center justify-center gap-2 border border-red-300 text-red-600 px-4 py-2.5 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
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
          <LoadingSpinner size="lg" color="vendor" label="Loading orders..." />
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
            onClick={fetchOrders}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Orders</h1>
          <p className="text-gray-600">Manage and track orders for your products (not service bookings)</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
          Products Only
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiTruck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
              <p className="text-sm text-gray-600">Shipped</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === filter
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
          >
            {loading ? (
              <LoadingSpinner size="sm" color="current" />
            ) : (
              <FiRefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Product Orders Found</h3>
          <p className="text-gray-500 mb-4">
            {orders.length === 0
              ? "You don't have any product orders yet. This page shows orders for PRODUCTS only, not service bookings."
              : "No orders match your search criteria."}
          </p>
          {orders.length === 0 && (
            <div className="text-sm text-gray-400">
              <p>Make sure you have products (not services) listed.</p>
              <p>Service bookings will appear in the Services → Bookings section.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Items</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Total</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Payment</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.customer.image ? (
                          <img
                            src={order.customer.image}
                            alt={order.customer.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
                            {order.customer.avatar}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{order.customer.name}</p>
                          <p className="text-sm text-gray-500">{order.customer.phone || order.customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{order.items.length} item(s)</p>
                      <p className="text-sm text-gray-500 truncate max-w-[150px]">
                        {order.items[0]?.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">₹{order.total}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{order.date}</p>
                      <p className="text-sm text-gray-500">{order.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                          disabled={updatingStatus === order.orderId}
                          className={`pl-3 pr-8 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} border-none cursor-pointer focus:ring-2 focus:ring-emerald-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem]`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          }}
                        >
                          {statusFilters.map((s) => s !== "All" && (
                            <option key={s} value={s} className="bg-white text-gray-900">{s}</option>
                          ))}
                        </select>
                        {updatingStatus === order.orderId && (
                          <LoadingSpinner size="sm" color="vendor" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${getPaymentColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </p>
                      <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMessage(order.customer.id)}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Message Customer"
                        >
                          <FiMessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Print Invoice"
                        >
                          <FiPrinter className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Showing count */}
      {filteredOrders.length > 0 && (
        <p className="text-center text-sm text-gray-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal />
    </div>
  );
}
