import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  MoreHorizontal,
  ShoppingBag,
  Users,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  TrendingUp
} from 'lucide-react';

export default function ServiceOrdersPage() {
  const serviceOrders = [
    {
      id: 1,
      orderId: 'ORD-SRV-001234',
      serviceName: 'Professional Home Cleaning',
      serviceProvider: 'Sarah Johnson',
      customer: 'Rahul Sharma',
      customerPhone: '+91 9876543210',
      customerEmail: 'rahul.sharma@email.com',
      location: 'Mumbai, Maharashtra',
      orderDate: '2024-11-20',
      scheduledDate: '2024-11-22',
      completedDate: '2024-11-22',
      amount: '₹2,500',
      platformFee: '₹250',
      providerEarning: '₹2,125',
      status: 'Completed',
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      rating: 4.8,
      duration: '3 hours',
      category: 'Home Services'
    },
    {
      id: 2,
      orderId: 'ORD-SRV-001235',
      serviceName: 'Plumbing Repair',
      serviceProvider: 'Mike Rodriguez',
      customer: 'Priya Patel',
      customerPhone: '+91 8765432109',
      customerEmail: 'priya.patel@email.com',
      location: 'Delhi, Delhi',
      orderDate: '2024-11-19',
      scheduledDate: '2024-11-20',
      completedDate: null,
      amount: '₹1,800',
      platformFee: '₹180',
      providerEarning: '₹1,530',
      status: 'In Progress',
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      rating: null,
      duration: '2 hours',
      category: 'Home Maintenance'
    },
    {
      id: 3,
      orderId: 'ORD-SRV-001236',
      serviceName: 'AC Repair & Installation',
      serviceProvider: 'Alex Thompson',
      customer: 'Amit Kumar',
      customerPhone: '+91 7654321098',
      customerEmail: 'amit.kumar@email.com',
      location: 'Bangalore, Karnataka',
      orderDate: '2024-11-18',
      scheduledDate: '2024-11-19',
      completedDate: '2024-11-19',
      amount: '₹3,200',
      platformFee: '₹320',
      providerEarning: '₹2,720',
      status: 'Completed',
      paymentStatus: 'Paid',
      paymentMethod: 'Debit Card',
      rating: 4.6,
      duration: '4 hours',
      category: 'Appliance Repair'
    },
    {
      id: 4,
      orderId: 'ORD-SRV-001237',
      serviceName: 'Laptop Repair Service',
      serviceProvider: 'David Kumar',
      customer: 'Neha Singh',
      customerPhone: '+91 6543210987',
      customerEmail: 'neha.singh@email.com',
      location: 'Chennai, Tamil Nadu',
      orderDate: '2024-11-17',
      scheduledDate: '2024-11-18',
      completedDate: null,
      amount: '₹2,200',
      platformFee: '₹220',
      providerEarning: '₹1,870',
      status: 'Cancelled',
      paymentStatus: 'Refunded',
      paymentMethod: 'UPI',
      rating: null,
      duration: '1.5 hours',
      category: 'Electronics Repair'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />COMPLETED</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />IN PROGRESS</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />PENDING</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />CANCELLED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />PAID</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />PENDING</span>;
      case 'Failed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />FAILED</span>;
      case 'Refunded':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />REFUNDED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">UNKNOWN</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Service Orders Management</h1>
          <p className="text-blue-100 mt-2">Monitor and manage all service bookings and orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Service Orders</p>
                <p className="text-2xl font-bold text-gray-900">3,247</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+18.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">2,891</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">89.0%</span>
              <span className="text-gray-500 ml-1">completion rate</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹65,47,800</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+22.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Order Value</p>
                <p className="text-2xl font-bold text-gray-900">₹2,017</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-600 font-medium">+8.5%</span>
              <span className="text-gray-500 ml-1">increase</span>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer, or service..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Categories</option>
                <option>Home Services</option>
                <option>Home Maintenance</option>
                <option>Appliance Repair</option>
                <option>Electronics Repair</option>
                <option>Beauty & Wellness</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Status</option>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Payments</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Failed</option>
                <option>Refunded</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export Orders
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service & Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule & Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                        <div className="text-sm text-gray-500">{order.category}</div>
                        <div className="text-xs text-gray-400">Ordered: {order.orderDate}</div>
                        <div className="text-xs text-gray-400">Duration: {order.duration}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.serviceName}</div>
                        <div className="text-sm text-blue-600">Provider: {order.serviceProvider}</div>
                        {order.rating && (
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">{order.rating}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.customerPhone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {order.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {order.scheduledDate}
                        </div>
                        {order.completedDate && (
                          <div className="text-sm text-green-600">Completed: {order.completedDate}</div>
                        )}
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {order.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{order.amount}</div>
                        <div className="text-xs text-gray-500">Platform: {order.platformFee}</div>
                        <div className="text-xs text-green-600">Provider: {order.providerEarning}</div>
                        <div className="text-sm text-blue-600 flex items-center mt-1">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {order.paymentMethod}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{serviceOrders.length}</span> of{' '}
              <span className="font-medium">3,247</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
