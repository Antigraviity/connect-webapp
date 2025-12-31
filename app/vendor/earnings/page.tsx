"use client";

import { useState, useEffect } from "react";
import { FiTrendingUp, FiDollarSign, FiClock, FiDownload, FiRefreshCw, FiAlertCircle, FiPackage } from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface EarningsData {
  totalRevenue: number;
  thisMonthRevenue: number;
  pendingPayout: number;
  totalOrders: number;
  thisMonthOrders: number;
  revenueChange: number;
}

interface ChartData {
  month: string;
  revenue: number;
}

interface RecentOrder {
  id: string;
  product: string;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

export default function VendorEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productEarnings, setProductEarnings] = useState<EarningsData | null>(null);
  const [serviceEarnings, setServiceEarnings] = useState<EarningsData | null>(null);
  const [productChartData, setProductChartData] = useState<ChartData[]>([]);
  const [serviceChartData, setServiceChartData] = useState<ChartData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    fetchAllEarnings();
  }, []);

  const fetchAllEarnings = async () => {
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

      // Fetch product earnings
      const productRes = await fetch(`/api/vendor/earnings?sellerId=${user.id}&type=PRODUCT`);
      const productData = await productRes.json();

      // Fetch service earnings
      const serviceRes = await fetch(`/api/vendor/earnings?sellerId=${user.id}&type=SERVICE`);
      const serviceData = await serviceRes.json();

      if (productData.success) {
        setProductEarnings(productData.earnings);
        setProductChartData(productData.chartData || []);
        setRecentOrders(productData.recentOrders || []);
      }

      if (serviceData.success) {
        setServiceEarnings(serviceData.earnings);
        setServiceChartData(serviceData.chartData || []);
        // Combine recent orders
        if (serviceData.recentOrders?.length > 0) {
          setRecentOrders(prev => [...prev, ...serviceData.recentOrders].slice(0, 10));
        }
      }

    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalEarnings = (productEarnings?.totalRevenue || 0) + (serviceEarnings?.totalRevenue || 0);
  const monthlyEarnings = (productEarnings?.thisMonthRevenue || 0) + (serviceEarnings?.thisMonthRevenue || 0);
  const pendingPayout = (productEarnings?.pendingPayout || 0) + (serviceEarnings?.pendingPayout || 0);
  const totalOrders = (productEarnings?.totalOrders || 0) + (serviceEarnings?.totalOrders || 0);

  // Combine chart data
  const combinedChartData = productChartData.map((item, index) => ({
    month: item.month,
    products: item.revenue,
    services: serviceChartData[index]?.revenue || 0,
    total: item.revenue + (serviceChartData[index]?.revenue || 0),
  }));

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString()}`;
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
            onClick={fetchAllEarnings}
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
          <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
          <p className="text-gray-600 mt-1">
            Track your earnings and manage payout history
          </p>
        </div>
        <button
          onClick={fetchAllEarnings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Earnings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FiDollarSign className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              {totalOrders} orders
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Earnings</p>
          <p className="text-3xl font-bold">{formatCurrency(totalEarnings)}</p>
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FiTrendingUp className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              This Month
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Monthly Earnings</p>
          <p className="text-3xl font-bold">{formatCurrency(monthlyEarnings)}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FiClock className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              Last 7 days
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Pending Payout</p>
          <p className="text-3xl font-bold">{formatCurrency(pendingPayout)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Earnings Trend (Last 12 Months)
          </h2>
          {combinedChartData.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#059669"
                  strokeWidth={2}
                  name="Total Earnings"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No earnings data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Products vs Services */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Products vs Services
          </h2>
          {combinedChartData.some(d => d.products > 0 || d.services > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="products" fill="#0d9488" name="Products" />
                <Bar dataKey="services" fill="#059669" name="Services" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No data to compare yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Product Sales</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold">{formatCurrency(productEarnings?.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold">{formatCurrency(productEarnings?.thisMonthRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-semibold">{productEarnings?.totalOrders || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Service Bookings</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold">{formatCurrency(serviceEarnings?.totalRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold">{formatCurrency(serviceEarnings?.thisMonthRevenue || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-semibold">{serviceEarnings?.totalOrders || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item</th>
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
                    <td className="py-3 px-4 text-sm text-gray-700">{order.product}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.customer}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-green-600">₹{order.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                        order.status === "Shipped" ? "bg-purple-100 text-purple-800" :
                          order.status === "Processing" ? "bg-teal-100 text-teal-800" :
                            "bg-yellow-100 text-yellow-800"
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
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400">Completed orders will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
