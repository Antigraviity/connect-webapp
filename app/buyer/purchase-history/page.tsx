"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiRefreshCw,
  FiStar,
  FiSearch,
  FiDollarSign,
  FiShoppingBag,
  FiFileText,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

interface OrderItem {
  id: string;
  title: string;
  images: string;
  price: number;
  seller: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  servicePrice: number;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  service: OrderItem;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  review?: {
    id: string;
    rating: number;
  };
}

// Status configuration
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: "Processing", color: "text-yellow-700", bgColor: "bg-yellow-100 border-yellow-200", icon: FiClock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-700", bgColor: "bg-blue-100 border-blue-200", icon: FiCheckCircle },
  IN_PROGRESS: { label: "In Transit", color: "text-purple-700", bgColor: "bg-purple-100 border-purple-200", icon: FiTruck },
  COMPLETED: { label: "Delivered", color: "text-green-700", bgColor: "bg-green-100 border-green-200", icon: FiCheckCircle },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100 border-red-200", icon: FiXCircle },
  REFUNDED: { label: "Refunded", color: "text-gray-700", bgColor: "bg-gray-100 border-gray-200", icon: FiRefreshCw },
};

export default function PurchaseHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch orders when user is available
  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch only PRODUCT type orders for purchase history
      const response = await fetch(`/api/orders?buyerId=${user.id}&type=PRODUCT&limit=100`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Parse images from JSON string
  const getProductImage = (imagesStr: string): string | null => {
    try {
      const images = typeof imagesStr === 'string' ? JSON.parse(imagesStr) : imagesStr;
      if (Array.isArray(images) && images.length > 0) {
        return images[0];
      }
    } catch (e) {}
    return null;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate expected delivery (3 days from order date)
  const getExpectedDelivery = (orderDate: string) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 3);
    return date;
  };

  // Filter orders
  let filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = filterStatus === "all";
    if (filterStatus === "delivered") matchesStatus = order.status === "COMPLETED";
    else if (filterStatus === "in-transit") matchesStatus = order.status === "IN_PROGRESS";
    else if (filterStatus === "processing") matchesStatus = order.status === "PENDING" || order.status === "CONFIRMED";
    else if (filterStatus === "cancelled") matchesStatus = order.status === "CANCELLED";
    
    return matchesSearch && matchesStatus;
  });

  // Sort orders
  filteredOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "amount-high":
        return b.totalAmount - a.totalAmount;
      case "amount-low":
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === "COMPLETED").length;
  const inTransitOrders = orders.filter(o => o.status === "IN_PROGRESS").length;
  const totalSpent = orders.filter(o => o.status === "COMPLETED").reduce((sum, o) => sum + o.totalAmount, 0);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading purchase history...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">You need to be signed in to view your purchase history.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
          <p className="text-gray-600 mt-1">
            {totalOrders} order{totalOrders !== 1 ? 's' : ''} • Total spent: ₹{totalSpent.toLocaleString()}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FiShoppingBag className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{deliveredOrders}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{inTransitOrders}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiTruck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                ₹{totalSpent >= 1000 ? `${(totalSpent / 1000).toFixed(1)}K` : totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="in-transit">In Transit</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterStatus !== "all"
              ? "No orders match your search criteria"
              : "You haven't placed any product orders yet"}
          </p>
          <Link
            href="/buyer/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPackage className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;
            const productImage = getProductImage(order.service?.images || '[]');
            const expectedDelivery = getExpectedDelivery(order.createdAt);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Order Number</p>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                      <div>
                        <p className="text-sm text-gray-600">
                          {order.status === "COMPLETED" ? "Delivered On" : "Expected Delivery"}
                        </p>
                        <p className="font-medium text-gray-900">
                          {order.status === "COMPLETED" 
                            ? formatDate(order.updatedAt)
                            : formatDate(expectedDelivery.toISOString())
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${status.bgColor} ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={order.service?.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <FiPackage className={`w-8 h-8 text-primary-400 ${productImage ? 'hidden' : ''}`} />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {order.seller?.name || 'Seller'}
                      </p>
                      <h4 className="font-semibold text-gray-900 mt-1">
                        {order.service?.title || 'Product'}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                        <span>Qty: 1</span>
                        <span>•</span>
                        <span className="font-semibold text-gray-900">
                          ₹{order.servicePrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Review Action */}
                    {order.status === "COMPLETED" && (
                      <div className="flex items-center">
                        {order.review ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                            <FiStar className="w-4 h-4 fill-green-700" />
                            <span>Reviewed</span>
                          </div>
                        ) : (
                          <Link
                            href={`/buyer/orders/${order.id}?review=true`}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                          >
                            <FiStar className="w-4 h-4" />
                            Write Review
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Payment Status</p>
                          <p className={`font-medium mt-1 ${
                            order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.paymentStatus}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Amount</p>
                          <p className="font-bold text-primary-600 text-lg mt-1">
                            ₹{order.totalAmount?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/buyer/orders/${order.id}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <FiFileText className="w-4 h-4" />
                          View Details
                        </Link>
                        {order.status === "COMPLETED" && (
                          <button className="flex items-center gap-2 px-4 py-2 border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium">
                            <FiRefreshCw className="w-4 h-4" />
                            Buy Again
                          </button>
                        )}
                        {(order.status === "IN_PROGRESS" || order.status === "CONFIRMED") && (
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            <FiTruck className="w-4 h-4" />
                            Track Order
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cancellation Reason */}
                    {order.status === "CANCELLED" && order.specialRequests && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-900">
                          <span className="font-semibold">Note:</span> {order.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
