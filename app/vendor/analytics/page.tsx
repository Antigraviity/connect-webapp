"use client";

import { useState } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiShoppingBag,
  FiDownload,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data
const revenueData = [
  { month: "Jan", revenue: 45000, orders: 120, customers: 85 },
  { month: "Feb", revenue: 52000, orders: 135, customers: 95 },
  { month: "Mar", revenue: 48000, orders: 125, customers: 88 },
  { month: "Apr", revenue: 61000, orders: 158, customers: 110 },
  { month: "May", revenue: 55000, orders: 142, customers: 98 },
  { month: "Jun", revenue: 68000, orders: 175, customers: 125 },
  { month: "Jul", revenue: 72000, orders: 185, customers: 132 },
  { month: "Aug", revenue: 67000, orders: 170, customers: 118 },
  { month: "Sep", revenue: 81000, orders: 210, customers: 145 },
  { month: "Oct", revenue: 79000, orders: 205, customers: 140 },
  { month: "Nov", revenue: 85000, orders: 220, customers: 155 },
  { month: "Dec", revenue: 92000, orders: 240, customers: 168 },
];

const servicePerformance = [
  { service: "AC Repair", bookings: 145, revenue: 72500, rating: 4.8 },
  { service: "Plumbing", bookings: 132, revenue: 66000, rating: 4.6 },
  { service: "Electrical Work", bookings: 118, revenue: 59000, rating: 4.7 },
  { service: "House Painting", bookings: 95, revenue: 47500, rating: 4.5 },
  { service: "Carpentry", bookings: 78, revenue: 39000, rating: 4.6 },
  { service: "Cleaning Services", bookings: 165, revenue: 41250, rating: 4.9 },
];

const customerDemographics = [
  { segment: "Residential", value: 65, color: "#3b82f6" },
  { segment: "Commercial", value: 25, color: "#10b981" },
  { segment: "Industrial", value: 10, color: "#f59e0b" },
];

const bookingTrends = [
  { day: "Mon", bookings: 32 },
  { day: "Tue", bookings: 28 },
  { day: "Wed", bookings: 35 },
  { day: "Thu", bookings: 42 },
  { day: "Fri", bookings: 48 },
  { day: "Sat", bookings: 65 },
  { day: "Sun", bookings: 55 },
];

const topCustomers = [
  { name: "Rahul Sharma", orders: 15, spent: 24500, lastOrder: "Nov 1, 2025" },
  { name: "Priya Patel", orders: 12, spent: 18900, lastOrder: "Nov 2, 2025" },
  { name: "Amit Kumar", orders: 10, spent: 16200, lastOrder: "Oct 28, 2025" },
  { name: "Sneha Reddy", orders: 9, spent: 14850, lastOrder: "Oct 30, 2025" },
  { name: "Vikram Singh", orders: 8, spent: 13600, lastOrder: "Nov 3, 2025" },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("year");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">
            <FiDownload className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-600">+24.5%</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹8,05,000</p>
          <p className="text-xs text-gray-500 mt-2">vs last period: ₹6,48,000</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-blue-600">+18.2%</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">2,085</p>
          <p className="text-xs text-gray-500 mt-2">Avg: 174 orders/month</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-purple-600">+32.1%</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Total Customers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">1,459</p>
          <p className="text-xs text-gray-500 mt-2">456 repeat customers</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-semibold text-green-600">+8.3%</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Avg Order Value</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹3,862</p>
          <p className="text-xs text-gray-500 mt-2">vs last period: ₹3,568</p>
        </div>
      </div>

      {/* Revenue & Orders Trend */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Revenue & Orders Trend (12 Months)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fill="url(#colorRevenue)"
              name="Revenue (₹)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
              name="Orders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Service Performance & Customer Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Performance */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Top Performing Services
          </h2>
          <div className="space-y-4">
            {servicePerformance.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{service.service}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{service.bookings} bookings</span>
                    <span>₹{service.revenue.toLocaleString()}</span>
                    <span className="text-yellow-600">★ {service.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Demographics */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Customer Segments
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerDemographics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, value }) => `${segment}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {customerDemographics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {customerDemographics.map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-gray-700">{segment.segment}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {segment.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Booking Trends */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Weekly Booking Pattern
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bookingTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-4">
          Peak booking days: <span className="font-semibold">Saturday & Sunday</span>
        </p>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Top Customers</h2>
          <button className="text-sm text-primary-600 font-semibold hover:text-primary-700">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Total Orders
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Total Spent
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Last Order
                </th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-bold">
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {customer.orders}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-600">
                    ₹{customer.spent.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {customer.lastOrder}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
