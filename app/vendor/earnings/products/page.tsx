"use client";

import { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
  FiShoppingCart,
  FiRefreshCw,
  FiPackage,
  FiAlertCircle,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EarningsData {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueChange: number;
  avgOrderValue: number;
  pendingPayout: number;
  totalOrders: number;
  thisMonthOrders: number;
}

interface ChartData {
  month: string;
  revenue: number;
}

interface RecentOrder {
  id: string;
  product: string;
  productImage: string | null;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

export default function ProductEarnings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<EarningsData>({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    revenueChange: 0,
    avgOrderValue: 0,
    pendingPayout: 0,
    totalOrders: 0,
    thisMonthOrders: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('Please login to view earnings');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const response = await fetch(`/api/vendor/earnings?sellerId=${user.id}&type=PRODUCT`);
      const data = await response.json();

      if (data.success) {
        setEarnings(data.earnings);
        setChartData(data.chartData || []);
        setRecentOrders(data.recentOrders || []);
      } else {
        setError(data.message || 'Failed to fetch earnings');
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${amount.toLocaleString()}`;
    }
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading earnings data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Earnings</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEarnings}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Revenue</h1>
          <p className="text-gray-600 mt-1">Track your product sales revenue</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchEarnings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            <FiDownload className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-green-600" />
            </div>
            {earnings.revenueChange !== 0 && (
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${earnings.revenueChange >= 0
                ? 'text-green-600 bg-green-50'
                : 'text-red-600 bg-red-50'
                }`}>
                {earnings.revenueChange >= 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                {Math.abs(earnings.revenueChange)}%
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">{earnings.totalOrders} orders</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-emerald-600" />
            </div>
            {earnings.thisMonthOrders > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {earnings.thisMonthOrders} orders
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.thisMonthRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Last month: {formatCurrency(earnings.lastMonthRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Avg. Order Value</p>
          <p className="text-2xl font-bold text-gray-900">₹{earnings.avgOrderValue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Per transaction</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Pending Payout</p>
          <p className="text-2xl font-bold text-gray-900">₹{earnings.pendingPayout.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days earnings</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Revenue Trend (Last 12 Months)</h3>
        {chartData.length > 0 && chartData.some(d => d.revenue > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No revenue data yet</p>
              <p className="text-sm text-gray-400">Complete orders to see your revenue trend</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-emerald-600">{order.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {order.productImage ? (
                          <img
                            src={order.productImage}
                            alt={order.product}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <FiPackage className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm text-gray-700">{order.product}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.customer}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{order.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{order.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Shipped"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "Processing"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
            <p className="text-sm text-gray-400">Orders will appear here when customers make purchases</p>
          </div>
        )}
      </div>
    </div>
  );
}
