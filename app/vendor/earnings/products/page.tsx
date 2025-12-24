"use client";

import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiArrowUp,
  FiShoppingCart,
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

const revenueData = [
  { month: "Jan", revenue: 28500 },
  { month: "Feb", revenue: 35800 },
  { month: "Mar", revenue: 32200 },
  { month: "Apr", revenue: 42500 },
  { month: "May", revenue: 48100 },
  { month: "Jun", revenue: 45800 },
  { month: "Jul", revenue: 52500 },
  { month: "Aug", revenue: 49200 },
  { month: "Sep", revenue: 58800 },
  { month: "Oct", revenue: 62500 },
  { month: "Nov", revenue: 68100 },
];

const recentOrders = [
  { id: "ORD-001234", product: "Fresh Vegetables Basket", customer: "John Doe", amount: 498, date: "Nov 24, 2024", status: "Delivered" },
  { id: "ORD-001235", product: "Organic Fruit Pack", customer: "Priya Singh", amount: 449, date: "Nov 24, 2024", status: "Shipped" },
  { id: "ORD-001236", product: "Homemade Murukku", customer: "Amit Verma", amount: 360, date: "Nov 23, 2024", status: "Delivered" },
  { id: "ORD-001237", product: "Farm Fresh Eggs", customer: "Neha Gupta", amount: 240, date: "Nov 22, 2024", status: "Delivered" },
  { id: "ORD-001238", product: "Fresh Paneer", customer: "Rajesh Kumar", amount: 560, date: "Nov 21, 2024", status: "Delivered" },
];

export default function ProductEarnings() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Revenue</h1>
          <p className="text-gray-600 mt-1">Track your product sales revenue</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          <FiDownload className="w-4 h-4" />
          Download Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <FiArrowUp className="w-3 h-3" /> +24.5%
            </span>
          </div>
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">₹5,24,000</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <FiArrowUp className="w-3 h-3" /> +18.3%
            </span>
          </div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-gray-900">₹68,100</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Avg. Order Value</p>
          <p className="text-2xl font-bold text-gray-900">₹385</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Pending Payout</p>
          <p className="text-2xl font-bold text-gray-900">₹8,450</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
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
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{order.product}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{order.customer}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{order.amount}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{order.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === "Delivered" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"
                    }`}>
                      {order.status}
                    </span>
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
