"use client";

import { FiTrendingUp, FiDollarSign, FiClock, FiDownload } from "react-icons/fi";
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

const earningsData = [
  { month: "Jun", earnings: 6500, orders: 42 },
  { month: "Jul", earnings: 7200, orders: 48 },
  { month: "Aug", earnings: 6800, orders: 45 },
  { month: "Sep", earnings: 8100, orders: 52 },
  { month: "Oct", earnings: 7900, orders: 50 },
  { month: "Nov", earnings: 8450, orders: 54 },
];

const transactions = [
  {
    id: "TXN-001",
    orderId: "ORD-1237",
    service: "House Painting",
    amount: 1299,
    fee: 129.9,
    netAmount: 1169.1,
    date: "Nov 1, 2025",
    status: "COMPLETED",
  },
  {
    id: "TXN-002",
    orderId: "ORD-1236",
    service: "Electrical Work",
    amount: 899,
    fee: 89.9,
    netAmount: 809.1,
    date: "Nov 2, 2025",
    status: "COMPLETED",
  },
  {
    id: "TXN-003",
    orderId: "ORD-1235",
    service: "Plumbing Service",
    amount: 699,
    fee: 69.9,
    netAmount: 629.1,
    date: "Nov 2, 2025",
    status: "COMPLETED",
  },
  {
    id: "TXN-004",
    orderId: "ORD-1234",
    service: "AC Repair",
    amount: 499,
    fee: 49.9,
    netAmount: 449.1,
    date: "Nov 3, 2025",
    status: "PENDING",
  },
];

const payouts = [
  {
    id: "PAY-001",
    amount: 15420,
    method: "Bank Transfer",
    reference: "REF123456",
    date: "Oct 25, 2025",
    status: "COMPLETED",
  },
  {
    id: "PAY-002",
    amount: 12850,
    method: "Bank Transfer",
    reference: "REF123455",
    date: "Sep 25, 2025",
    status: "COMPLETED",
  },
];

export default function VendorEarningsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
        <p className="text-gray-600 mt-1">
          Track your earnings and manage payout history
        </p>
      </div>

      {/* Earnings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FiDollarSign className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              +18.2%
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Earnings</p>
          <p className="text-3xl font-bold">₹45,780</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FiTrendingUp className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              This Month
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Monthly Earnings</p>
          <p className="text-3xl font-bold">₹8,450</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FiClock className="w-8 h-8" />
            <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              Next: Nov 25
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Pending Payout</p>
          <p className="text-3xl font-bold">₹2,145</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Earnings Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#10b981"
                strokeWidth={2}
                name="Earnings (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders vs Earnings */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Orders vs Earnings
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
              <Bar
                yAxisId="right"
                dataKey="earnings"
                fill="#10b981"
                name="Earnings (₹)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Transaction ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Service
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Platform Fee (10%)
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Net Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {txn.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-blue-600 hover:underline cursor-pointer">
                    {txn.orderId}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {txn.service}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                    ₹{txn.amount}
                  </td>
                  <td className="py-3 px-4 text-sm text-red-600">
                    -₹{txn.fee.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-600">
                    ₹{txn.netAmount.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{txn.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        txn.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Payout History</h2>
        <div className="space-y-4">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{payout.id}</p>
                  <p className="text-sm text-gray-600">
                    {payout.method} • {payout.reference}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  ₹{payout.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">{payout.date}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                {payout.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
