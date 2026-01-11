"use client";

import { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

export default function RevenuePage() {
  const [period, setPeriod] = useState("thisMonth");
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    total: 0,
    serviceRevenue: 0,
    productRevenue: 0,
    jobRevenue: 0,
    serviceBookings: 0,
    productOrders: 0,
  });

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, ordersRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/orders'),
      ]);

      const [bookingsData, ordersData] = await Promise.all([
        bookingsRes.json(),
        ordersRes.json(),
      ]);

      const serviceBookings = bookingsData.bookings?.filter((b: any) => b.type === 'SERVICE') || [];
      const productOrders = ordersData.orders?.filter((o: any) => o.type === 'PRODUCT') || [];

      const serviceRevenue = serviceBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
      const productRevenue = productOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const totalRevenue = serviceRevenue + productRevenue;

      setRevenueData({
        total: totalRevenue,
        serviceRevenue,
        productRevenue,
        jobRevenue: 0, // Not tracked yet
        serviceBookings: serviceBookings.length,
        productOrders: productOrders.length,
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (amount: number, total: number) => {
    return total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
  };

  const breakdown = [
    {
      source: "Service Bookings",
      amount: revenueData.serviceRevenue,
      percentage: parseFloat(calculatePercentage(revenueData.serviceRevenue, revenueData.total)),
      growth: "+18.5%",
      color: "bg-primary-500"
    },
    {
      source: "Product Sales",
      amount: revenueData.productRevenue,
      percentage: parseFloat(calculatePercentage(revenueData.productRevenue, revenueData.total)),
      growth: "+28.2%",
      color: "bg-primary-500"
    },
    {
      source: "Job Postings",
      amount: revenueData.jobRevenue,
      percentage: parseFloat(calculatePercentage(revenueData.jobRevenue, revenueData.total)),
      growth: "+35.4%",
      color: "bg-primary-500"
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and analyze platform revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="thisQuarter">This Quarter</option>
            <option value="thisYear">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Total Revenue Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
            <p className="text-4xl font-bold mt-1 text-gray-900">
              {loading ? "-" : `₹${revenueData.total.toLocaleString()}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <FiTrendingUp className="w-4 h-4" />
                +22.8%
              </span>
              <span className="text-gray-500 text-sm">vs last period</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
            <FiDollarSign className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Source</h2>
          <div className="space-y-4">
            {breakdown.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                    <span className="font-medium text-gray-900">{item.source}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {loading ? "-" : `₹${item.amount.toLocaleString()}`}
                    </p>
                    <p className={`text-xs ${item.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {item.growth}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.percentage}% of total</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h2>
          <div className="text-center py-16">
            <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Historical Data Coming Soon</p>
            <p className="text-sm text-gray-400">Monthly revenue trends will appear here once tracking is enabled</p>
          </div>
        </div>
      </div>

      {/* Top Revenue Generators - Coming Soon */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Revenue Generators</h2>
        </div>
        <div className="text-center py-16">
          <FiDollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Performance Tracking Coming Soon</p>
          <p className="text-sm text-gray-400">Top revenue generators will be tracked once analytics is enabled</p>
        </div>
      </div>
    </div>
  );
}
