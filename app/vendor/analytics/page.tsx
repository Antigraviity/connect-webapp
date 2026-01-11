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
  { segment: "Residential", value: 65, color: "#059669" }, // emerald-600
  { segment: "Commercial", value: 25, color: "#0d9488" }, // teal-600
  { segment: "Industrial", value: 10, color: "#f59e0b" }, // amber-500
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive insights into your business performance</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all active:scale-95">
            <FiDownload className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: "₹8,05,000", change: "+24.5%", icon: FiDollarSign, bg: "bg-green-50/50", iconBg: "bg-green-100", iconColor: "text-green-600", sub: "vs last period: ₹6,48K" },
          { label: "Total Orders", value: "2,085", change: "+18.2%", icon: FiShoppingBag, bg: "bg-emerald-50/50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", sub: "Avg: 174 orders/mo" },
          { label: "Total Customers", value: "1,459", change: "+32.1%", icon: FiUsers, bg: "bg-purple-50/50", iconBg: "bg-purple-100", iconColor: "text-purple-600", sub: "456 repeat users" },
          { label: "Avg Order Value", value: "₹3,862", change: "+8.3%", icon: FiTrendingUp, bg: "bg-amber-50/50", iconBg: "bg-amber-100", iconColor: "text-amber-600", sub: "vs last period: ₹3,5K" }
        ].map((item, index) => (
          <div key={index} className={`${item.bg} rounded-2xl border border-gray-100 p-4 transition-all hover:border-emerald-100 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${item.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <span className={`text-[10px] font-black ${item.iconColor === 'text-amber-600' ? 'text-emerald-600' : item.iconColor} bg-white/50 px-2 py-0.5 rounded-lg border border-white/20 shadow-sm`}>
                {item.change}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{item.value}</p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{item.label}</p>
              <p className="text-[9px] font-bold text-gray-400 mt-2 italic truncate">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue & Orders Trend */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-emerald-500 rounded-full" />
          Revenue & Orders Trend (12 Months)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
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
              stroke="#059669"
              fill="url(#colorRevenue)"
              name="Revenue (₹)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#0d9488"
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
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-emerald-500 rounded-full" />
          Weekly Booking Pattern
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bookingTrends}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
            <Tooltip
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="bookings" fill="#10B981" name="Bookings" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm font-bold text-gray-400 mt-6 text-center italic">
          Peak booking days: <span className="text-emerald-600">Saturday & Sunday</span>
        </p>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full" />
            Top Customers
          </h2>
          <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-xl">
            View All →
          </button>
        </div>

        {/* Mobile List View */}
        <div className="grid grid-cols-1 gap-4 sm:hidden">
          {topCustomers.map((customer, index) => (
            <div key={index} className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 truncate">{customer.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{customer.lastOrder}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-600">₹{customer.spent.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-gray-400">{customer.orders} Orders</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 rounded-2xl">
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</th>
                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Spent</th>
                <th className="text-left py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-4 text-sm font-black text-emerald-600">#{index + 1}</td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900">{customer.name}</td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-500">{customer.orders}</td>
                  <td className="py-4 px-4 text-sm font-black text-emerald-600">₹{customer.spent.toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-400 italic">{customer.lastOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
