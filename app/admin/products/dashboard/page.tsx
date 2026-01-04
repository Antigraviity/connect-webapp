"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiBox,
  FiPlus,
  FiHeart,
  FiAlertTriangle,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface DashboardStats {
  totalProducts: number;
  activeSellers: number;
  todayOrders: number;
  monthlyRevenue: number;
  deliveredOrders: number;
  inTransitOrders: number;
  processingOrders: number;
  pendingOrders: number;
  lowStockProducts: Array<{ name: string; seller: string; stock: number }>;
  wishlistedCount: number;
}

interface RecentOrder {
  id: string;
  product: string;
  customer: string;
  seller: string;
  amount: string;
  status: string;
  time: string;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return { bg: "bg-green-100", text: "text-green-800", label: "DELIVERED" };
    case "OUT_FOR_DELIVERY":
      return { bg: "bg-blue-100", text: "text-blue-800", label: "OUT FOR DELIVERY" };
    case "PROCESSING":
      return { bg: "bg-purple-100", text: "text-purple-800", label: "PROCESSING" };
    case "CONFIRMED":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "CONFIRMED" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

export default function ProductsDashboard() {
  const [timeFilter, setTimeFilter] = useState("This Week");
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeSellers: 0,
    todayOrders: 0,
    monthlyRevenue: 0,
    deliveredOrders: 0,
    inTransitOrders: 0,
    processingOrders: 0,
    pendingOrders: 0,
    lowStockProducts: [],
    wishlistedCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/products/dashboard");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      } else {
        setError(data.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("Network error: Could not fetch dashboard data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" color="admin" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-800 mb-4">
            <FiAlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Error Loading Dashboard</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const productStatCards = [
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      change: "+15.3%",
      changeType: "increase",
      icon: FiShoppingBag,
      color: "bg-orange-500",
    },
    {
      label: "Active Sellers",
      value: stats.activeSellers.toLocaleString(),
      change: "+10.2%",
      changeType: "increase",
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      label: "Today's Orders",
      value: stats.todayOrders.toString(),
      change: "+22.5%",
      changeType: "increase",
      icon: FiPackage,
      color: "bg-green-500",
    },
    {
      label: "Monthly Revenue",
      value: `₹${(stats.monthlyRevenue / 100000).toFixed(1)}L`,
      change: "+18.7%",
      changeType: "increase",
      icon: FiDollarSign,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Products Dashboard</h1>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              LIVE DATA
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            Manage products, orders, and seller activities across the marketplace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <Link
            href="/admin/products/categories"
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <FiPlus className="w-4 h-4" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {productStatCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <FiCheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Delivered</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.deliveredOrders.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">this week</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <FiTruck className="w-5 h-5" />
            <span className="text-sm font-medium">In Transit</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.inTransitOrders}</p>
          <p className="text-xs text-blue-600 mt-1">currently</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-2 text-purple-700 mb-2">
            <FiBox className="w-5 h-5" />
            <span className="text-sm font-medium">Processing</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.processingOrders}</p>
          <p className="text-xs text-purple-600 mt-1">orders</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <div className="flex items-center gap-2 text-yellow-700 mb-2">
            <FiClock className="w-5 h-5" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</p>
          <p className="text-xs text-yellow-600 mt-1">approval</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <FiAlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Low Stock</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.lowStockProducts.length}</p>
          <p className="text-xs text-red-600 mt-1">products</p>
        </div>

        <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
          <div className="flex items-center gap-2 text-pink-700 mb-2">
            <FiHeart className="w-5 h-5" />
            <span className="text-sm font-medium">Wishlisted</span>
          </div>
          <p className="text-2xl font-bold text-pink-900">{stats.wishlistedCount.toLocaleString()}</p>
          <p className="text-xs text-pink-600 mt-1">items</p>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link
              href="/admin/products/orders"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              View All →
            </Link>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-900">{order.product}</h4>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.customer} • {order.seller}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{order.amount}</p>
                        <p className="text-xs text-gray-500">{order.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              {stats.lowStockProducts.length} items
            </span>
          </div>
          <div className="p-6">
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">All products well stocked!</p>
            ) : (
              <div className="space-y-4">
                {stats.lowStockProducts.map((product, index) => (
                  <div
                    key={index}
                    className="p-4 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <span className="text-lg font-bold text-red-600">{product.stock}</span>
                    </div>
                    <p className="text-sm text-gray-600">{product.seller}</p>
                    <p className="text-xs text-red-600 mt-1">left</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
