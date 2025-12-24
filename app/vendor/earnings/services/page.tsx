"use client";

import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiArrowUp,
  FiArrowDown,
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

const earningsData = [
  { month: "Jan", earnings: 12500 },
  { month: "Feb", earnings: 15800 },
  { month: "Mar", earnings: 14200 },
  { month: "Apr", earnings: 18500 },
  { month: "May", earnings: 22100 },
  { month: "Jun", earnings: 19800 },
  { month: "Jul", earnings: 24500 },
  { month: "Aug", earnings: 21200 },
  { month: "Sep", earnings: 26800 },
  { month: "Oct", earnings: 28500 },
  { month: "Nov", earnings: 32100 },
];

const recentTransactions = [
  { id: "TXN-001", service: "AC Repair & Service", customer: "Rahul Sharma", amount: 499, date: "Nov 24, 2024", status: "Completed" },
  { id: "TXN-002", service: "Plumbing Services", customer: "Priya Patel", amount: 349, date: "Nov 24, 2024", status: "Completed" },
  { id: "TXN-003", service: "Electrical Repair", customer: "Amit Kumar", amount: 299, date: "Nov 23, 2024", status: "Pending" },
  { id: "TXN-004", service: "House Painting", customer: "Sneha Reddy", amount: 2499, date: "Nov 22, 2024", status: "Completed" },
  { id: "TXN-005", service: "AC Repair & Service", customer: "Vikram Singh", amount: 499, date: "Nov 21, 2024", status: "Completed" },
];

export default function ServiceEarnings() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Earnings</h1>
          <p className="text-gray-600 mt-1">Track your service booking earnings</p>
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
              <FiArrowUp className="w-3 h-3" /> +18.5%
            </span>
          </div>
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-2xl font-bold text-gray-900">₹2,36,000</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <FiArrowUp className="w-3 h-3" /> +12.3%
            </span>
          </div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-gray-900">₹32,100</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Avg. per Booking</p>
          <p className="text-2xl font-bold text-gray-900">₹650</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Pending Payout</p>
          <p className="text-2xl font-bold text-gray-900">₹4,145</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Earnings Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, "Earnings"]} />
            <Area type="monotone" dataKey="earnings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{txn.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{txn.service}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{txn.customer}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{txn.amount}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{txn.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      txn.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {txn.status}
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
