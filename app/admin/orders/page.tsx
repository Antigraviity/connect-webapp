'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  MapPin,
  Eye,
  Edit3,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Truck
} from 'lucide-react';

export default function OrdersPage() {
  const orders = [
    {
      id: 1,
      orderId: 'ORD001247',
      type: 'Service Booking',
      serviceName: 'Home Cleaning Service',
      customer: 'Rahul Sharma',
      provider: 'Sarah Johnson',
      amount: '₹1,200',
      commission: '₹120',
      status: 'Completed',
      paymentStatus: 'Paid',
      orderDate: '2024-11-20',
      completionDate: '2024-11-20',
      location: 'Mumbai, Maharashtra',
      duration: '3 hours'
    },
    {
      id: 2,
      orderId: 'ORD001248',
      type: 'Service Booking',
      serviceName: 'Plumbing Repair',
      customer: 'Priya Patel',
      provider: 'Mike Rodriguez',
      amount: '₹800',
      commission: '₹80',
      status: 'In Progress',
      paymentStatus: 'Paid',
      orderDate: '2024-11-19',
      completionDate: null,
      location: 'Delhi, Delhi',
      duration: '2 hours'
    },
    {
      id: 3,
      orderId: 'ORD001249',
      type: 'Job Posting',
      serviceName: 'React Developer Hiring',
      customer: 'Tech Solutions Inc.',
      provider: 'Platform',
      amount: '₹2,500',
      commission: '₹250',
      status: 'Active',
      paymentStatus: 'Paid',
      orderDate: '2024-11-18',
      completionDate: null,
      location: 'Bangalore, Karnataka',
      duration: '30 days listing'
    },
    {
      id: 4,
      orderId: 'ORD001250',
      type: 'Service Booking',
      serviceName: 'AC Repair',
      customer: 'Amit Kumar',
      provider: 'David Kumar',
      amount: '₹950',
      commission: '₹95',
      status: 'Cancelled',
      paymentStatus: 'Refunded',
      orderDate: '2024-11-17',
      completionDate: null,
      location: 'Chennai, Tamil Nadu',
      duration: '1.5 hours'
    }
  ];

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Expanded filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Filtering logic
  const filteredOrders = orders.filter(order => {
    // Search query check
    const matchesSearch = !searchQuery ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    // Type check
    const matchesType = typeFilter === 'All Types' || order.type === typeFilter;

    // Status check
    const matchesStatus = statusFilter === 'All Status' || order.status === statusFilter;

    // Date check
    const orderDate = new Date(order.orderDate);
    const matchesStartDate = !startDate || orderDate >= new Date(startDate);
    const matchesEndDate = !endDate || orderDate <= new Date(endDate);

    // Amount check
    const amountVal = parseInt(order.amount.replace(/[^0-9]/g, ''));
    const matchesMinAmount = !minAmount || amountVal >= parseInt(minAmount);
    const matchesMaxAmount = !maxAmount || amountVal <= parseInt(maxAmount);

    return matchesSearch && matchesType && matchesStatus && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Clock className="w-3 h-3 mr-1" />In Progress</span>;
      case 'Active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><Clock className="w-3 h-3 mr-1" />Active</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Pending</span>;
      case 'Failed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      case 'Refunded':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">Refunded</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Service Booking':
        return <Package className="h-4 w-4 text-primary-500" />;
      case 'Job Posting':
        return <Truck className="h-4 w-4 text-primary-500" />;
      default:
        return <ShoppingCart className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Orders & Payments</h1>
            <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full">REAL-TIME</span>
          </div>
          <p className="text-gray-600 mt-1">Manage all orders, transactions, and payment activities</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">8,456</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+18.2%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹12,45,670</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+22.8%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Commission Earned</p>
              <p className="text-2xl font-bold text-gray-900">₹1,24,567</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <Package className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+15.3%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-full">
              <CheckCircle className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+2.1%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Order Status Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">5,234</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary-600">1,456</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">892</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary-600">567</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">307</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option>All Types</option>
                <option>Service Booking</option>
                <option>Job Posting</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option>All Status</option>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Active</option>
                <option>Cancelled</option>
                <option>Pending</option>
              </select>
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${showMoreFilters ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showMoreFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md border border-gray-100 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Order Date (From)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Order Date (To)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount Range (₹)</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('All Types');
                    setStatusFilter('All Status');
                    setStartDate('');
                    setEndDate('');
                    setMinAmount('');
                    setMaxAmount('');
                  }}
                  className="text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors mb-2"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Orders ({filteredOrders.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="p-2 bg-primary-50 rounded-lg mr-3">
                          {getTypeIcon(order.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                          <div className="text-sm text-gray-700">{order.serviceName}</div>
                          <div className="text-xs text-gray-500">{order.type}</div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {order.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {order.customer}
                        </div>
                        <div className="text-sm text-gray-500">Provider: {order.provider}</div>
                        <div className="text-xs text-gray-400">Duration: {order.duration}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{order.amount}</div>
                        <div className="text-sm text-green-600">Commission: {order.commission}</div>
                        <div className="mt-1">
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {order.orderDate}
                        </div>
                        {order.completionDate && (
                          <div className="text-sm text-gray-500">
                            Completed: {order.completionDate}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
          <span className="font-medium">8,456</span> results
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium">
            1
          </button>
          {orders.length > 10 && (
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              2
            </button>
          )}
          {orders.length > 20 && (
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              3
            </button>
          )}
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled={orders.length <= 10}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
