"use client";

import { useState, useEffect } from "react";
import {
  FiPackage,
  FiSearch,
  FiEye,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiMapPin,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  bookingDate: string;
  service: {
    title: string;
    price: number;
  };
  buyer: {
    name: string;
    email: string;
    city?: string;
  };
  seller: {
    name: string;
    email: string;
  };
}

interface Stats {
  total: number;
  delivered: number;
  inProgress: number;
  cancelled: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return { bg: "bg-green-100", text: "text-green-800", label: "Delivered" };
    case "IN_PROGRESS":
      return { bg: "bg-primary-100", text: "text-primary-800", label: "Out for Delivery" };
    case "PENDING":
      return { bg: "bg-primary-100", text: "text-primary-800", label: "Processing" };
    case "CONFIRMED":
      return { bg: "bg-primary-100", text: "text-primary-800", label: "Confirmed" };
    case "CANCELLED":
      return { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" };
    case "REFUNDED":
      return { bg: "bg-slate-100", text: "text-slate-800", label: "Refunded" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

const getPaymentBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return { bg: "bg-green-50", text: "text-green-700" };
    case "REFUNDED":
      return { bg: "bg-slate-50", text: "text-slate-700" };
    case "PENDING":
      return { bg: "bg-yellow-50", text: "text-yellow-700" };
    case "FAILED":
      return { bg: "bg-red-50", text: "text-red-700" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700" };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return `₹${amount.toFixed(2)}`;
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    delivered: 0,
    inProgress: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, [filterStatus, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/products/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setStats(data.stats);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('An error occurred while fetching orders');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportOrders = () => {
    // TODO: Implement export functionality
    alert('Export functionality coming soon!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all product orders across the marketplace.
          </p>
        </div>
        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Export Orders
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-xs text-gray-500">Delivered</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiTruck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiXCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              <p className="text-xs text-gray-500">Cancelled</p>
            </div>
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
              placeholder="Search by order ID, customer, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner size="lg" color="admin" label="Loading..." />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <FiXCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No orders found</p>
              {(searchQuery || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="mt-4 text-primary-600 hover:text-primary-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    const paymentBadge = getPaymentBadge(order.paymentStatus);

                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{order.buyer.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FiMapPin className="w-3 h-3" /> {order.buyer.city || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{order.service.title}</p>
                          <p className="text-xs text-gray-500">{order.seller.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded ${paymentBadge.bg} ${paymentBadge.text}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => window.location.href = `/admin/orders/${order.id}`}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View order details"
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
                Showing {orders.length} orders
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
                {orders.length > 10 && (
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">2</button>
                )}
                {orders.length > 20 && (
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">3</button>
                )}
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled={orders.length <= 10}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
