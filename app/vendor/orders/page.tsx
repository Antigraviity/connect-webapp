"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiX,
  FiMapPin,
  FiPhone,
  FiMessageSquare,
  FiPrinter,
  FiDownload,
} from "react-icons/fi";

// Mock orders data
const ordersData = [
  {
    id: "ORD-2024-001234",
    customer: { name: "John Doe", phone: "+91 98765 43210", address: "123 Main Street, New Delhi", avatar: "JD" },
    items: [
      { name: "Fresh Vegetables Basket", qty: 2, price: 249 },
      { name: "Farm Fresh Eggs", qty: 1, price: 120 },
    ],
    total: 618,
    date: "Nov 24, 2024",
    time: "10:30 AM",
    status: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
  },
  {
    id: "ORD-2024-001235",
    customer: { name: "Priya Singh", phone: "+91 87654 32109", address: "456 Park Avenue, Mumbai", avatar: "PS" },
    items: [
      { name: "Organic Fruit Pack", qty: 1, price: 449 },
    ],
    total: 449,
    date: "Nov 24, 2024",
    time: "11:45 AM",
    status: "Shipped",
    paymentStatus: "Paid",
    paymentMethod: "Card",
  },
  {
    id: "ORD-2024-001236",
    customer: { name: "Amit Verma", phone: "+91 76543 21098", address: "789 Lake Road, Bangalore", avatar: "AV" },
    items: [
      { name: "Homemade Murukku", qty: 3, price: 120 },
      { name: "Homemade Pickle", qty: 2, price: 180 },
    ],
    total: 720,
    date: "Nov 23, 2024",
    time: "2:15 PM",
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "COD",
  },
  {
    id: "ORD-2024-001237",
    customer: { name: "Neha Gupta", phone: "+91 65432 10987", address: "321 Hill View, Chennai", avatar: "NG" },
    items: [
      { name: "Fresh Paneer", qty: 2, price: 280 },
    ],
    total: 560,
    date: "Nov 23, 2024",
    time: "4:00 PM",
    status: "Pending",
    paymentStatus: "Pending",
    paymentMethod: "COD",
  },
  {
    id: "ORD-2024-001238",
    customer: { name: "Rajesh Kumar", phone: "+91 54321 09876", address: "555 Garden City, Hyderabad", avatar: "RK" },
    items: [
      { name: "Fresh Vegetables Basket", qty: 1, price: 249 },
      { name: "Organic Fruit Pack", qty: 1, price: 449 },
      { name: "Farm Fresh Eggs", qty: 2, price: 120 },
    ],
    total: 938,
    date: "Nov 22, 2024",
    time: "9:30 AM",
    status: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
  },
];

const statusFilters = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "Processing": "bg-blue-100 text-blue-800",
    "Shipped": "bg-purple-100 text-purple-800",
    "Delivered": "bg-green-100 text-green-800",
    "Cancelled": "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getPaymentStatusColor = (status: string) => {
  return status === "Paid" ? "text-green-600" : "text-orange-600";
};

export default function VendorOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<typeof ordersData[0] | null>(null);

  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: ordersData.filter(o => o.status === "Pending").length,
    processing: ordersData.filter(o => o.status === "Processing").length,
    shipped: ordersData.filter(o => o.status === "Shipped").length,
    delivered: ordersData.filter(o => o.status === "Delivered").length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Orders</h1>
        <p className="text-gray-600 mt-1">Manage and track your product orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiClock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiPackage className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiTruck className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
              <p className="text-sm text-gray-600">Shipped</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Items</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Total</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Payment</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">{order.id}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {order.customer.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-xs text-gray-500">{order.customer.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-700">{order.items.length} item(s)</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {order.items.map(i => i.name).join(", ")}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">₹{order.total}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-700">{order.date}</p>
                    <p className="text-xs text-gray-500">{order.time}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </p>
                    <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Print">
                        <FiPrinter className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500">{selectedOrder.date} at {selectedOrder.time}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedOrder.customer.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-2">
                    <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{selectedOrder.customer.address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{item.price * item.qty}</p>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <p className="font-semibold text-gray-900">Total</p>
                    <p className="text-lg font-bold text-blue-600">₹{selectedOrder.total}</p>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["Processing", "Shipped", "Delivered"].map((status) => (
                    <button
                      key={status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedOrder.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4" />
                Message Customer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                <FiTruck className="w-4 h-4" />
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
